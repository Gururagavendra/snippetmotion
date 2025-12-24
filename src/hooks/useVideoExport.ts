import { useRef, useCallback, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import GIF from "gif.js";

interface UseVideoExportOptions {
  fps?: number;
  quality?: number;
}

export const useVideoExport = (options: UseVideoExportOptions = {}) => {
  const { fps = 60, quality = 1.0 } = options;
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportPhase, setExportPhase] = useState<string>("");
  const framesRef = useRef<HTMLCanvasElement[]>([]);

  const captureFrame = useCallback(async (element: HTMLElement): Promise<HTMLCanvasElement | null> => {
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
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

        const animationPromise = animationFn();

        const captureInterval = setInterval(async () => {
          const frame = await captureFrame(previewElement);
          if (frame) {
            framesRef.current.push(frame);
            frameCount++;
            setProgress(Math.min((frameCount / totalFrames) * 60, 59));
          }
        }, frameInterval);

        await animationPromise;
        clearInterval(captureInterval);

        setExportPhase("finalizing");
        setProgress(65);
        const finalFrame = await captureFrame(previewElement);
        if (finalFrame) {
          framesRef.current.push(finalFrame);
        }

        setExportPhase("rendering");
        setProgress(70);
        
        const videoBlob = await createVideoFromFrames(framesRef.current, fps, (renderProgress) => {
          setProgress(70 + (renderProgress * 30));
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
        // Lower FPS for GIF (20fps is good for file size)
        const gifFps = 20;
        const totalFrames = Math.ceil((durationMs / 1000) * gifFps);
        const frameInterval = durationMs / totalFrames;
        let frameCount = 0;

        const animationPromise = animationFn();

        const captureInterval = setInterval(async () => {
          const frame = await captureFrame(previewElement);
          if (frame) {
            framesRef.current.push(frame);
            frameCount++;
            setProgress(Math.min((frameCount / totalFrames) * 60, 59));
          }
        }, frameInterval);

        await animationPromise;
        clearInterval(captureInterval);

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
  return new Promise(async (resolve, reject) => {
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
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 12000000,
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

      mediaRecorder.start();

      const frameDelay = 1000 / fps;
      for (let i = 0; i < frames.length; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(frames[i], 0, 0);
        await new Promise((r) => setTimeout(r, frameDelay));
        
        if (onProgress) {
          onProgress((i + 1) / frames.length);
        }
      }

      await new Promise((r) => setTimeout(r, 500));
      
      mediaRecorder.stop();
    } catch (error) {
      reject(error);
    }
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
