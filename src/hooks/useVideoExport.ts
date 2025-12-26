import { useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import GIF from "gif.js";

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
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 1.5, // Reduced from 2 for faster capture while maintaining quality
        logging: false,
        useCORS: false, // Disabled for speed - we don't need external images
        allowTaint: false, // Disabled for speed
        imageTimeout: 0, // Skip waiting for images
        removeContainer: true, // Clean up immediately
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
        const totalFrames = Math.ceil((durationMs / 1000) * fps);
        const frameInterval = durationMs / totalFrames;
        let frameCount = 0;
        let isCapturing = true;
        let lastCaptureTime = performance.now();

        // Start animation
        const animationPromise = animationFn();

        // Use requestAnimationFrame for smoother, more reliable frame capture
        const captureLoop = async () => {
          if (!isCapturing) return;
          
          const now = performance.now();
          const elapsed = now - lastCaptureTime;
          
          // Only capture if enough time has passed for next frame
          if (elapsed >= frameInterval) {
            const frame = await captureFrame(previewElement);
            if (frame) {
              framesRef.current.push(frame);
              frameCount++;
              // Frame capture is ~85% of total work, scale progress accordingly
              setProgress(Math.min((frameCount / totalFrames) * 85, 84));
            }
            lastCaptureTime = now - (elapsed % frameInterval); // Adjust for timing drift
          }
          
          if (isCapturing) {
            requestAnimationFrame(captureLoop);
          }
        };

        // Start capture loop
        requestAnimationFrame(captureLoop);

        // Wait for animation to complete
        await animationPromise;
        isCapturing = false;

        setExportPhase("finalizing");
        setProgress(88);
        const finalFrame = await captureFrame(previewElement);
        if (finalFrame) {
          framesRef.current.push(finalFrame);
        }

        setExportPhase("rendering");
        setProgress(92);
        
        // Rendering is fast now, only 8% of progress
        const videoBlob = await createVideoFromFrames(framesRef.current, fps, (renderProgress) => {
          setProgress(92 + (renderProgress * 8));
        });

        setProgress(100);
        
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `snippet-motion-${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

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
        // Lower FPS for GIF (15fps for smaller file size, still smooth)
        const gifFps = 15;
        const totalFrames = Math.ceil((durationMs / 1000) * gifFps);
        const frameInterval = durationMs / totalFrames;
        let frameCount = 0;
        let isCapturing = true;
        let lastCaptureTime = performance.now();

        // Start animation
        const animationPromise = animationFn();

        // Use requestAnimationFrame for smoother, more reliable frame capture
        const captureLoop = async () => {
          if (!isCapturing) return;
          
          const now = performance.now();
          const elapsed = now - lastCaptureTime;
          
          // Only capture if enough time has passed for next frame
          if (elapsed >= frameInterval) {
            const frame = await captureFrame(previewElement);
            if (frame) {
              framesRef.current.push(frame);
              frameCount++;
              // Frame capture is ~70% of total work for GIF (rendering takes longer)
              setProgress(Math.min((frameCount / totalFrames) * 70, 69));
            }
            lastCaptureTime = now - (elapsed % frameInterval); // Adjust for timing drift
          }
          
          if (isCapturing) {
            requestAnimationFrame(captureLoop);
          }
        };

        // Start capture loop
        requestAnimationFrame(captureLoop);

        // Wait for animation to complete
        await animationPromise;
        isCapturing = false;

        setExportPhase("finalizing");
        setProgress(72);
        const finalFrame = await captureFrame(previewElement);
        if (finalFrame) {
          framesRef.current.push(finalFrame);
        }

        setExportPhase("rendering");
        setProgress(75);

        // GIF rendering takes longer, give it 25% of progress
        const gifBlob = await createGifFromFrames(framesRef.current, gifFps, (renderProgress) => {
          setProgress(75 + (renderProgress * 25));
        });

        setProgress(100);

        const url = URL.createObjectURL(gifBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `snippet-motion-${Date.now()}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

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
        const firstFrame = frames[0];
        
        const canvas = document.createElement("canvas");
        canvas.width = firstFrame.width;
        canvas.height = firstFrame.height;
        const ctx = canvas.getContext("2d");
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Use captureStream with 0 to manually request frames
        const stream = canvas.captureStream(0);
        const videoTrack = stream.getVideoTracks()[0];
        
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
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          videoBitsPerSecond: 8000000, // Slightly reduced for faster encoding
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const isMP4 = selectedMimeType.includes("mp4");
          const blob = new Blob(chunks, { type: isMP4 ? "video/mp4" : "video/webm" });
          resolve(blob);
        };

        // Request data more frequently for smoother encoding
        mediaRecorder.start(100);

        // Process frames immediately without real-time delays
        // Each frame is held for the duration it should appear (1000/fps ms)
        const frameDurationMs = 1000 / fps;
        let currentTime = 0;
        
        for (let i = 0; i < frames.length; i++) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(frames[i], 0, 0);
          
          // Request a new frame from the canvas stream
          if (videoTrack && 'requestFrame' in videoTrack) {
            (videoTrack as any).requestFrame();
          }
          
          // Small yield to allow encoder to process (much faster than real-time)
          if (i % 10 === 0) {
            await new Promise((r) => setTimeout(r, 1));
          }
          
          currentTime += frameDurationMs;
          
          if (onProgress) {
            onProgress((i + 1) / frames.length);
          }
        }

        // Brief pause to ensure last frames are encoded
        await new Promise((r) => setTimeout(r, 100));
        
        mediaRecorder.stop();
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
