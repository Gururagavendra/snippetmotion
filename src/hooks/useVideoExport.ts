import { useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import GIF from "gif.js";

// Detect if we're on a mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth < 768);
};

interface UseVideoExportOptions {
  fps?: number;
  quality?: number;
}

export const useVideoExport = (options: UseVideoExportOptions = {}) => {
  const { fps = 30, quality = 1.0 } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportPhase, setExportPhase] = useState<string>("");
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  const captureFrame = useCallback(async (element: HTMLElement): Promise<HTMLCanvasElement | null> => {
    try {
      const mobile = isMobileDevice();
      
      // Wait a bit to ensure DOM is fully rendered, especially important on mobile
      await new Promise(resolve => setTimeout(resolve, mobile ? 30 : 5)); // Optimized for mobile
      
      // Force a reflow to ensure all styles are applied
      void element.offsetHeight;
      
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 1.5, // Reduced scale for better performance on both mobile and desktop
        logging: false,
        useCORS: true,
        allowTaint: true,
        // Mobile-specific options
        ...(mobile && {
          removeContainer: true,
          imageTimeout: 10000, // Reduced from 15000 for faster capture
          onclone: (clonedDoc) => {
            // Ensure all images are loaded in cloned document
            const images = clonedDoc.querySelectorAll('img');
            images.forEach((img) => {
              if (!img.complete) {
                img.style.display = 'none';
              }
            });
          }
        })
      });
      return canvas;
    } catch (error) {
      console.error("Frame capture error:", error);
      return null;
    }
  }, []);

  const exportVideo = useCallback(
    async (
      previewElement: HTMLElement,
      animationFn: () => Promise<void>,
      durationMs: number = 12500
    ) => {
      setIsExporting(true);
      setProgress(0);
      setExportPhase("capturing");
      framesRef.current = [];

      try {
        const mobile = isMobileDevice();
        // Use effective FPS (already optimized to 30 by default)
        const effectiveFps = mobile ? Math.min(fps, 30) : fps;
        const totalFrames = Math.ceil((durationMs / 1000) * effectiveFps);
        const frameInterval = Math.max(durationMs / totalFrames, mobile ? 33 : 16); // Optimized: 33ms = ~30fps minimum for mobile
        let frameCount = 0;
        let captureStartTime = Date.now();

        // Wait a bit before starting to ensure everything is ready (especially on mobile)
        await new Promise(resolve => setTimeout(resolve, mobile ? 100 : 30)); // Optimized for mobile

        const animationPromise = animationFn();

        // Capture frames sequentially to avoid race conditions, especially on mobile
        const captureFrames = async () => {
          while (frameCount < totalFrames) {
            const frame = await captureFrame(previewElement);
            if (frame) {
              framesRef.current.push(frame);
              frameCount++;
              setProgress(Math.min((frameCount / totalFrames) * 60, 59));
            }
            
            // Wait for next frame interval
            await new Promise(resolve => setTimeout(resolve, frameInterval));
            
            // Stop if animation is complete and we've captured enough frames
            if (frameCount >= totalFrames) {
              break;
            }
          }
        };

        // Start capturing frames
        const capturePromise = captureFrames();
        
        // Wait for animation to complete
        await animationPromise;
        
        // Wait for capture to complete
        await capturePromise;
        
        // Continue capturing frames for the full duration even after animation completes
        const elapsedTime = Date.now() - captureStartTime;
        const remainingTime = Math.max(0, durationMs - elapsedTime);
        
        if (remainingTime > 0) {
          // Capture additional frames during remaining time
          const additionalFrames = Math.ceil((remainingTime / 1000) * effectiveFps);
          for (let i = 0; i < additionalFrames; i++) {
            const frame = await captureFrame(previewElement);
            if (frame) {
              framesRef.current.push(frame);
            }
            await new Promise(resolve => setTimeout(resolve, frameInterval));
          }
        }

        setExportPhase("finalizing");
        setProgress(65);
        const finalFrame = await captureFrame(previewElement);
        if (finalFrame) {
          framesRef.current.push(finalFrame);
        }

        setExportPhase("rendering");
        setProgress(70);
        
        // Use effective FPS for video creation
        const videoBlob = await createVideoFromFrames(framesRef.current, effectiveFps, (renderProgress) => {
          setProgress(70 + (renderProgress * 30));
        });

        setProgress(100);
        
        // Improved download handling for mobile and desktop
        const url = URL.createObjectURL(videoBlob);
        const filename = `snippet-motion-${Date.now()}.mp4`;
        
        // Try using the download attribute first (works on most browsers)
        try {
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          
          // Use requestAnimationFrame to ensure the click happens in a user interaction context
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              a.click();
              // Clean up after a short delay to ensure download starts
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 100);
            });
          });
        } catch (error) {
          // Fallback: open in new tab for mobile browsers that don't support download
          console.warn("Download failed, opening in new tab:", error);
          window.open(url, '_blank');
          // Revoke URL after a delay to allow download
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        toast.success("Video exported successfully!");
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Failed to export video. Please try again.");
      } finally {
        setIsExporting(false);
        setProgress(0);
        setExportPhase("");
        framesRef.current = [];
      }
    },
    [captureFrame, fps]
  );

  const exportGif = useCallback(
    async (
      previewElement: HTMLElement,
      animationFn: () => Promise<void>,
      durationMs: number = 12500
    ) => {
      setIsExporting(true);
      setProgress(0);
      setExportPhase("capturing");
      framesRef.current = [];

      try {
        const mobile = isMobileDevice();
        // Lower FPS for GIF (20fps is good for file size, even lower on mobile)
        const gifFps = mobile ? 15 : 20;
        const totalFrames = Math.ceil((durationMs / 1000) * gifFps);
        const frameInterval = Math.max(durationMs / totalFrames, mobile ? 33 : 16); // Optimized: 33ms = ~30fps minimum for mobile
        let frameCount = 0;
        let captureStartTime = Date.now();

        // Wait a bit before starting to ensure everything is ready (especially on mobile)
        await new Promise(resolve => setTimeout(resolve, mobile ? 100 : 50)); // Optimized for mobile

        const animationPromise = animationFn();

        // Capture frames sequentially to avoid race conditions, especially on mobile
        const captureFrames = async () => {
          while (frameCount < totalFrames) {
            const frame = await captureFrame(previewElement);
            if (frame) {
              framesRef.current.push(frame);
              frameCount++;
              setProgress(Math.min((frameCount / totalFrames) * 60, 59));
            }
            
            // Wait for next frame interval
            await new Promise(resolve => setTimeout(resolve, frameInterval));
            
            // Stop if animation is complete and we've captured enough frames
            if (frameCount >= totalFrames) {
              break;
            }
          }
        };

        // Start capturing frames
        const capturePromise = captureFrames();
        
        // Wait for animation to complete
        await animationPromise;
        
        // Wait for capture to complete
        await capturePromise;
        
        // Continue capturing frames for the full duration even after animation completes
        const elapsedTime = Date.now() - captureStartTime;
        const remainingTime = Math.max(0, durationMs - elapsedTime);
        
        if (remainingTime > 0) {
          // Capture additional frames during remaining time
          const additionalFrames = Math.ceil((remainingTime / 1000) * gifFps);
          for (let i = 0; i < additionalFrames; i++) {
            const frame = await captureFrame(previewElement);
            if (frame) {
              framesRef.current.push(frame);
            }
            await new Promise(resolve => setTimeout(resolve, frameInterval));
          }
        }

        setExportPhase("finalizing");
        setProgress(65);
        const finalFrame = await captureFrame(previewElement);
        if (finalFrame) {
          framesRef.current.push(finalFrame);
        }

        setExportPhase("rendering");
        setProgress(70);

        const gifBlob = await createGifFromFrames(framesRef.current, gifFps, (renderProgress) => {
          setProgress(70 + (renderProgress * 30));
        });

        setProgress(100);

        // Improved download handling for mobile and desktop
        const url = URL.createObjectURL(gifBlob);
        const filename = `snippet-motion-${Date.now()}.gif`;
        
        // Try using the download attribute first (works on most browsers)
        try {
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          
          // Use requestAnimationFrame to ensure the click happens in a user interaction context
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              a.click();
              // Clean up after a short delay to ensure download starts
              setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }, 100);
            });
          });
        } catch (error) {
          // Fallback: open in new tab for mobile browsers that don't support download
          console.warn("Download failed, opening in new tab:", error);
          window.open(url, '_blank');
          // Revoke URL after a delay to allow download
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        toast.success("GIF exported successfully!");
      } catch (error) {
        console.error("GIF export error:", error);
        toast.error("Failed to export GIF. Please try again.");
      } finally {
        setIsExporting(false);
        setProgress(0);
        setExportPhase("");
        framesRef.current = [];
      }
    },
    [captureFrame]
  );

  return { exportVideo, exportGif, isExporting, progress, exportPhase };
};

async function createVideoFromFrames(
  frames: HTMLCanvasElement[], 
  fps: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const mobile = isMobileDevice();
        const firstFrame = frames[0];
        
        const canvas = document.createElement("canvas");
        canvas.width = firstFrame.width;
        canvas.height = firstFrame.height;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        const stream = canvas.captureStream(fps);
        
        const mimeTypes = [
          "video/mp4;codecs=avc1.42E01E",
          "video/mp4;codecs=h264",
          "video/mp4",
          "video/webm;codecs=h264",
          "video/webm;codecs=vp9",
          "video/webm"
        ];
        
        let selectedMimeType = "video/webm";
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            break;
          }
        }
        
        // Lower bitrate on mobile for better compatibility and stability
        const bitrate = mobile ? 4000000 : 12000000;
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          videoBitsPerSecond: bitrate,
          // Add timeslice for mobile to ensure data is available in chunks
          ...(mobile && { timeslice: 100 })
        });

        const chunks: Blob[] = [];
        let hasError = false;
        
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onerror = (e) => {
          console.error("MediaRecorder error:", e);
          hasError = true;
          reject(new Error("MediaRecorder error occurred"));
        };

        mediaRecorder.onstop = () => {
          if (hasError) return;
          
          const isMP4 = selectedMimeType.includes("mp4");
          const blob = new Blob(chunks, { type: isMP4 ? "video/mp4" : "video/webm" });
          
          // Validate blob size (should be > 0)
          if (blob.size === 0) {
            reject(new Error("Generated video blob is empty"));
            return;
          }
          
          resolve(blob);
        };

        // Wait a bit before starting to ensure MediaRecorder is ready (especially on mobile)
        await new Promise((r) => setTimeout(r, mobile ? 50 : 30)); // Optimized for mobile
        
        mediaRecorder.start(mobile ? 50 : undefined); // Optimized timeslice for mobile (reduced from 100ms)

        const frameDelay = 1000 / fps;
        for (let i = 0; i < frames.length; i++) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frames[i], 0, 0);
          
          // Add small delay between frames on mobile for stability
          await new Promise((r) => setTimeout(r, frameDelay + (mobile ? 2 : 0))); // Optimized for mobile
          
          if (onProgress) {
            onProgress((i + 1) / frames.length);
          }
        }

        // Wait longer on mobile to ensure all data is captured
        await new Promise((r) => setTimeout(r, mobile ? 500 : 300)); // Optimized for mobile
        
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        } else {
          reject(new Error("MediaRecorder stopped unexpectedly"));
        }
      } catch (error) {
        reject(error);
      }
    })();
  });
}

async function createGifFromFrames(
  frames: HTMLCanvasElement[],
  fps: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const firstFrame = frames[0];
      
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: firstFrame.width,
        height: firstFrame.height,
        workerScript: '/gif.worker.js',
      });

      const delay = 1000 / fps;

      frames.forEach((frame, index) => {
        gif.addFrame(frame, { delay, copy: true });
        if (onProgress) {
          onProgress((index + 1) / frames.length * 0.5);
        }
      });

      gif.on('progress', (p: number) => {
        if (onProgress) {
          onProgress(0.5 + p * 0.5);
        }
      });

      gif.on('finished', (blob: Blob) => {
        resolve(blob);
      });

      gif.render();
    } catch (error) {
      reject(error);
    }
  });
}
