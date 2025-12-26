import { useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import GIF from "gif.js";

interface UseVideoExportOptions {
  fps?: number;
  quality?: number;
  resolution?: "720p" | "1080p" | "4k";
}

export const useVideoExport = (options: UseVideoExportOptions = {}) => {
  const { fps = 30, quality = 1.0, resolution = "1080p" } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportPhase, setExportPhase] = useState<string>("");
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  // Calculate scale based on resolution for high quality
  const getScaleForResolution = useCallback((res: "720p" | "1080p" | "4k"): number => {
    switch (res) {
      case "720p":
        return 2.0; // 720p: 2x scale
      case "1080p":
        return 3.0; // 1080p: 3x scale for crisp quality
      case "4k":
        return 4.0; // 4K: 4x scale for maximum quality
      default:
        return 2.0;
    }
  }, []);

  const captureFrame = useCallback(async (element: HTMLElement, targetWidth?: number, targetHeight?: number): Promise<HTMLCanvasElement | null> => {
    try {
      // If target dimensions provided, calculate exact scale to avoid scaling artifacts
      let scale: number;
      if (targetWidth && targetHeight) {
        const elementWidth = element.offsetWidth || element.clientWidth;
        const elementHeight = element.offsetHeight || element.clientHeight;
        // Calculate scale to match target resolution exactly
        const scaleX = targetWidth / elementWidth;
        const scaleY = targetHeight / elementHeight;
        scale = Math.min(scaleX, scaleY); // Use smaller to fit
      } else {
        scale = getScaleForResolution(resolution);
      }
      
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: scale,
        logging: false,
        useCORS: false,
        allowTaint: false,
        imageTimeout: 0,
        removeContainer: true,
        // Prevent rendering artifacts
        foreignObjectRendering: false,
        // Better gradient rendering
        onclone: (clonedDoc) => {
          // Force GPU acceleration for gradients
          const clonedElement = clonedDoc.querySelector('[data-html2canvas-ignore="false"]') || 
                               clonedDoc.body.querySelector('div');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.transform = 'translateZ(0)';
            (clonedElement as HTMLElement).style.willChange = 'transform';
          }
        },
      });
      return canvas;
    } catch (error) {
      console.error("Frame capture error:", error);
      return null;
    }
  }, [resolution, getScaleForResolution]);

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
        // Get target resolution dimensions
        const targetResolutions = {
          "720p": { width: 1280, height: 720 },
          "1080p": { width: 1920, height: 1080 },
          "4k": { width: 3840, height: 2160 },
        };
        const targetRes = targetResolutions[resolution];
        
        // Calculate aspect ratio to determine final dimensions
        const elementAspect = previewElement.offsetWidth / previewElement.offsetHeight;
        const targetAspect = targetRes.width / targetRes.height;
        
        let captureWidth = targetRes.width;
        let captureHeight = targetRes.height;
        
        if (elementAspect > targetAspect) {
          // Element is wider - fit to width
          captureHeight = targetRes.width / elementAspect;
        } else {
          // Element is taller - fit to height
          captureWidth = targetRes.height * elementAspect;
        }
        
        const totalFrames = Math.ceil((durationMs / 1000) * fps);
        const frameInterval = durationMs / totalFrames;
        let isCapturing = true;
        let lastCaptureTime = performance.now();
        const captureStartTime = performance.now();

        // Start animation
        const animationPromise = animationFn();

        // Use requestAnimationFrame for smoother, more reliable frame capture
        const captureLoop = async () => {
          if (!isCapturing) return;
          
          const now = performance.now();
          const elapsed = now - lastCaptureTime;
          const totalElapsed = now - captureStartTime;
          
          // Smooth time-based progress (0-85% for capture phase)
          setProgress(Math.min((totalElapsed / durationMs) * 85, 84));
          
          // Only capture if enough time has passed for next frame
          if (elapsed >= frameInterval) {
            // Capture at exact target resolution to avoid scaling artifacts
            const frame = await captureFrame(previewElement, Math.round(captureWidth), Math.round(captureHeight));
            if (frame) {
              framesRef.current.push(frame);
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
        const finalFrame = await captureFrame(previewElement, Math.round(captureWidth), Math.round(captureHeight));
        if (finalFrame) {
          framesRef.current.push(finalFrame);
        }

        setExportPhase("rendering");
        setProgress(92);
        
        // Pass durationMs and resolution to createVideoFromFrames for proper timing and quality
        const videoBlob = await createVideoFromFrames(framesRef.current, fps, durationMs, resolution, (renderProgress) => {
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
    [captureFrame, fps, resolution]
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
        let isCapturing = true;
        let lastCaptureTime = performance.now();
        const captureStartTime = performance.now();

        // Start animation
        const animationPromise = animationFn();

        // Use requestAnimationFrame for smoother, more reliable frame capture
        const captureLoop = async () => {
          if (!isCapturing) return;
          
          const now = performance.now();
          const elapsed = now - lastCaptureTime;
          const totalElapsed = now - captureStartTime;
          
          // Smooth time-based progress (0-70% for capture phase)
          setProgress(Math.min((totalElapsed / durationMs) * 70, 69));
          
          // Only capture if enough time has passed for next frame
          if (elapsed >= frameInterval) {
            const frame = await captureFrame(previewElement);
            if (frame) {
              framesRef.current.push(frame);
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
  durationMs: number,
  resolution: "720p" | "1080p" | "4k",
  onProgress?: (progress: number) => void
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        const firstFrame = frames[0];
        
        // Target resolutions
        const targetResolutions = {
          "720p": { width: 1280, height: 720 },
          "1080p": { width: 1920, height: 1080 },
          "4k": { width: 3840, height: 2160 },
        };
        
        const targetRes = targetResolutions[resolution];
        
        // Frames are already captured at target resolution, just center them
        const sourceAspect = firstFrame.width / firstFrame.height;
        const targetAspect = targetRes.width / targetRes.height;
        
        // Create canvas at target resolution
        const canvas = document.createElement("canvas");
        canvas.width = targetRes.width;
        canvas.height = targetRes.height;
        const ctx = canvas.getContext("2d", { 
          willReadFrequently: false,
          alpha: false 
        });
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        // Disable image smoothing to prevent gradient artifacts - use nearest neighbor
        // This prevents diagonal stripes from gradient interpolation
        ctx.imageSmoothingEnabled = false;
        
        // Fill with black background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate centering (frames are already at correct size)
        let offsetX = 0;
        let offsetY = 0;
        let drawWidth = firstFrame.width;
        let drawHeight = firstFrame.height;
        
        if (sourceAspect > targetAspect) {
          // Source is wider - center vertically
          offsetY = Math.round((targetRes.height - firstFrame.height) / 2);
        } else {
          // Source is taller - center horizontally
          offsetX = Math.round((targetRes.width - firstFrame.width) / 2);
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
        
        // Higher bitrate for higher resolutions
        const bitrates = {
          "720p": 8000000,   // 8 Mbps
          "1080p": 16000000, // 16 Mbps
          "4k": 50000000,    // 50 Mbps
        };
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: selectedMimeType,
          videoBitsPerSecond: bitrates[resolution],
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

        // Calculate the actual frame duration based on captured frames and target duration
        // This ensures the video plays at the correct duration
        // MediaRecorder timestamps frames based on when they're received, so we must
        // feed frames at approximately real-time speed for correct video duration
        const frameDuration = durationMs / frames.length;
        
        for (let i = 0; i < frames.length; i++) {
          // Clear and fill background
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw frame at exact size (no scaling) - this prevents gradient artifacts
          ctx.drawImage(frames[i], offsetX, offsetY);
          
          // Request a new frame from the canvas stream
          if (videoTrack && 'requestFrame' in videoTrack) {
            (videoTrack as any).requestFrame();
          }
          
          // Wait for the proper frame duration to get correct video timing
          // This is necessary because MediaRecorder uses real-time timestamps
          await new Promise((r) => setTimeout(r, frameDuration));
          
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
