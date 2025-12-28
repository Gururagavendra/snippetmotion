import { useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import GIF from "gif.js";

// Utility function to properly dispose of canvas elements and free memory
const disposeCanvas = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) return;

  try {
    // Clear the canvas content
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Set dimensions to 0 to release GPU memory and canvas context
    canvas.width = 0;
    canvas.height = 0;

    // Remove any event listeners (if any)
    canvas.removeAttribute('width');
    canvas.removeAttribute('height');
  } catch (error) {
    console.warn('Error disposing canvas:', error);
  }
};

// Utility function to dispose of all canvases in an array
const disposeCanvasArray = (canvases: HTMLCanvasElement[]) => {
  canvases.forEach(canvas => disposeCanvas(canvas));
};

interface UseVideoExportOptions {
  fps?: number;
  quality?: number;
  resolution?: "720p" | "1080p" | "4k";
  typingDelay?: number;
}

export const useVideoExport = (options: UseVideoExportOptions = {}) => {
  const { fps = 30, quality = 1.0, resolution = "1080p", typingDelay = 40 } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportPhase, setExportPhase] = useState<string>("");
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  // Calculate scale based on resolution for MAXIMUM POSSIBLE quality
  // Extreme supersampling - captures at massive resolution then scales down
  // This produces the sharpest possible output matching browser rendering
  const getScaleForResolution = useCallback((res: "720p" | "1080p" | "4k"): number => {
    switch (res) {
      case "720p":
        return 5.0; // 720p: 5x scale 
      case "1080p":
        return 6.0; // 1080p: 6x scale
      case "4k":
        return 8.0; // 4K: 8x scale for absolute maximum quality
      default:
        return 5.0;
    }
  }, []);

  const captureFrame = useCallback(async (element: HTMLElement, _targetWidth?: number, _targetHeight?: number): Promise<HTMLCanvasElement | null> => {
    try {
      // ALWAYS use maximum scale for absolute best quality (extreme supersampling)
      const scale = getScaleForResolution(resolution);
      
      // Force a repaint to ensure gradients are fully rendered before capture
      void element.offsetHeight;
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: scale,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
        removeContainer: true,
        foreignObjectRendering: false,
        // Maximum quality settings for html2canvas
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        // Enhanced clone processing for maximum fidelity - especially gradients
        onclone: (clonedDoc, clonedElement) => {
          // Apply maximum quality rendering to the cloned element
          if (clonedElement) {
            // Force GPU-accelerated rendering for smooth gradients
            clonedElement.style.transform = 'translateZ(0)';
            clonedElement.style.backfaceVisibility = 'hidden';
            clonedElement.style.willChange = 'transform, background';
            
            // CRITICAL: Force high-quality gradient rendering
            // Use smooth rendering for gradients (not crisp-edges which is for pixel art)
            clonedElement.style.imageRendering = 'high-quality';
            (clonedElement.style as any).imageRendering = 'auto';
            
            // Maximum text quality
            clonedElement.style.textRendering = 'geometricPrecision';
            (clonedElement.style as any).webkitFontSmoothing = 'antialiased';
            (clonedElement.style as any).MozOsxFontSmoothing = 'grayscale';
            
            // Force high DPI rendering for background gradients
            clonedElement.style.backgroundSize = '100% 100%';
            clonedElement.style.backgroundRepeat = 'no-repeat';
            
            // Apply to all child elements for consistent quality
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.textRendering = 'geometricPrecision';
              
              // CRITICAL: Ensure background gradients render at maximum quality
              const computedStyle = window.getComputedStyle(htmlEl);
              if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
                // Force high-quality gradient rendering
                htmlEl.style.imageRendering = 'auto';
                htmlEl.style.backgroundSize = '100% 100%';
                htmlEl.style.backgroundRepeat = 'no-repeat';
                htmlEl.style.backgroundPosition = 'center';
                htmlEl.style.backgroundAttachment = 'fixed';
                // Force GPU acceleration for gradients
                htmlEl.style.transform = 'translateZ(0)';
                htmlEl.style.willChange = 'background-image';
              }
              
              // Also check inline styles
              if (htmlEl.style.background || htmlEl.style.backgroundImage) {
                htmlEl.style.imageRendering = 'auto';
                htmlEl.style.backgroundSize = '100% 100%';
                htmlEl.style.backgroundRepeat = 'no-repeat';
                htmlEl.style.transform = 'translateZ(0)';
              }
            });
            
            // Force repaint to ensure gradients render at full quality
            void clonedElement.offsetHeight;
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
            // Capture at maximum resolution for crystal clear quality
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
        setProgress(88);
        const finalFrame = await captureFrame(previewElement);
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

        // Dispose of all captured frames to free memory
        disposeCanvasArray(framesRef.current);
      } catch (error) {
        console.error("Export error:", error);
        toast.error("Failed to export video. Please try again.");
      } finally {
        setIsExporting(false);
        setProgress(0);
        setExportPhase("");
        // Dispose of any remaining canvases and clear the array reference
        disposeCanvasArray(framesRef.current);
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
        // Use typingDelay as the frame interval to match character-by-character animation
        const frameInterval = typingDelay;
        const totalFrames = Math.ceil(durationMs / frameInterval);
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

        // Use the typingDelay as the frame delay - this matches the actual animation timing
        // Convert to centiseconds (GIF delay is in 1/100th of a second)
        const gifFrameDelay = Math.max(1, Math.round(typingDelay / 10));

        // GIF rendering takes longer, give it 25% of progress
        const gifBlob = await createGifFromFrames(framesRef.current, gifFrameDelay, (renderProgress) => {
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

        // Dispose of all captured frames to free memory
        disposeCanvasArray(framesRef.current);
      } catch (error) {
        console.error("GIF export error:", error);
        toast.error("Failed to export GIF. Please try again.");
      } finally {
        setIsExporting(false);
        setProgress(0);
        setExportPhase("");
        // Dispose of any remaining canvases and clear the array reference
        disposeCanvasArray(framesRef.current);
        framesRef.current = [];
      }
    },
    [captureFrame, typingDelay]
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
    // Declare canvas outside try block so it's accessible in catch block for cleanup
    let canvas: HTMLCanvasElement | null = null;

    (async () => {
      try {
        const firstFrame = frames[0];

        // Target resolutions - exact output dimensions
        const targetResolutions = {
          "720p": { width: 1280, height: 720 },
          "1080p": { width: 1920, height: 1080 },
          "4k": { width: 3840, height: 2160 },
        };

        const targetRes = targetResolutions[resolution];

        // Create canvas at EXACT target resolution (no DPI scaling - causes stream issues)
        canvas = document.createElement("canvas");
        canvas.width = targetRes.width;
        canvas.height = targetRes.height;
        
        const ctx = canvas.getContext("2d", { 
          willReadFrequently: false,
          alpha: false,
          desynchronized: false,  // Ensure synchronized rendering for quality
        });
        
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        // ULTIMATE QUALITY: Enable highest quality rendering at every step
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Additional quality settings for text and graphics
        (ctx as any).textRendering = 'optimizeLegibility';
        (ctx as any).fontSmooth = 'always';
        
        // Calculate aspect ratios for proper scaling
        const sourceWidth = firstFrame.width;
        const sourceHeight = firstFrame.height;
        const sourceAspect = sourceWidth / sourceHeight;
        const targetAspect = targetRes.width / targetRes.height;
        
        // Calculate draw dimensions to FILL the canvas while maintaining aspect ratio
        let drawWidth: number, drawHeight: number, offsetX: number, offsetY: number;
        
        if (sourceAspect > targetAspect) {
          // Source is wider than target - fit to width, center vertically
          drawWidth = targetRes.width;
          drawHeight = targetRes.width / sourceAspect;
          offsetX = 0;
          offsetY = Math.round((targetRes.height - drawHeight) / 2);
        } else {
          // Source is taller than target - fit to height, center horizontally
          drawHeight = targetRes.height;
          drawWidth = targetRes.height * sourceAspect;
          offsetX = Math.round((targetRes.width - drawWidth) / 2);
          offsetY = 0;
        }

        // Use captureStream with 0 to manually request frames
        const stream = canvas.captureStream(0);
        const videoTrack = stream.getVideoTracks()[0];
        
        // Prioritize VP9 for superior quality at high bitrates
        const mimeTypes = [
          "video/webm;codecs=vp9",  // Best quality - VP9
          "video/webm;codecs=vp8",
          "video/webm",
          "video/mp4;codecs=avc1.42E01E",
          "video/mp4;codecs=h264",
          "video/mp4",
        ];
        
        let selectedMimeType = "video/webm";
        for (const mimeType of mimeTypes) {
          if (MediaRecorder.isTypeSupported(mimeType)) {
            selectedMimeType = mimeType;
            break;
          }
        }
        
        // ABSOLUTE MAXIMUM BITRATES - No compression artifacts
        // These are extremely high to ensure zero quality loss
        const bitrates = {
          "720p": 40000000,     // 40 Mbps - overkill for 720p = perfect quality
          "1080p": 80000000,    // 80 Mbps - double Blu-ray = lossless appearance
          "4k": 200000000,      // 200 Mbps - maximum possible for perfect 4K text
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

          // Dispose of the rendering canvas to free memory
          disposeCanvas(canvas);

          resolve(blob);
        };

        // Request data very frequently for maximum quality encoding
        mediaRecorder.start(16);  // ~60fps data chunks for smooth encoding

        // Calculate frame duration for correct video timing
        const frameDuration = durationMs / frames.length;
        
        for (let i = 0; i < frames.length; i++) {
          // Reset smoothing quality before each frame (some browsers reset it)
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Clear canvas with black background
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw frame with maximum quality scaling
          // The source frames are 6x supersampled, scaling down produces ultra-sharp output
          ctx.drawImage(
            frames[i],
            0, 0, sourceWidth, sourceHeight,  // Source rectangle (full high-res frame)
            offsetX, offsetY, drawWidth, drawHeight  // Destination rectangle (scaled to fit)
          );
          
          // Request a new frame from the canvas stream
          if (videoTrack && 'requestFrame' in videoTrack) {
            (videoTrack as any).requestFrame();
          }
          
          // Wait for proper frame duration for correct video timing
          await new Promise((r) => setTimeout(r, frameDuration));
          
          if (onProgress) {
            onProgress((i + 1) / frames.length);
          }
        }

        // Brief pause to ensure last frames are fully encoded
        await new Promise((r) => setTimeout(r, 150));
        
        mediaRecorder.stop();
      } catch (error) {
        // Dispose of canvas on error to prevent memory leaks
        disposeCanvas(canvas);
        reject(error);
      }
    })();
  });
}

async function createGifFromFrames(
  frames: HTMLCanvasElement[],
  frameDelayCentiseconds: number,
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

      // Use the provided frame delay directly (already in centiseconds)
      // GIF delay is in 1/100th of a second (centiseconds)
      const delay = Math.max(1, frameDelayCentiseconds);

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
        // Dispose of all frame canvases after GIF creation to free memory
        disposeCanvasArray(frames);
        resolve(blob);
      });

      gif.render();
    } catch (error) {
      // Dispose of frames on error to prevent memory leaks
      disposeCanvasArray(frames);
      reject(error);
    }
  });
}
