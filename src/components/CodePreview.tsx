import { forwardRef, useEffect, useState, useImperativeHandle } from "react";
import { motion } from "framer-motion";

export interface CodePreviewHandle {
  startAnimation: () => Promise<void>;
  resetAnimation: () => void;
}

interface CodePreviewProps {
  code: string;
  theme: string;
  typingDelay?: number;
  isAnimating?: boolean;
  showWatermark?: boolean;
}

const themeGradients: Record<string, { bg: string; card: string }> = {
  cyberpunk: {
    bg: "linear-gradient(135deg, #0f0f23 0%, #1a0a2e 50%, #16213e 100%)",
    card: "linear-gradient(180deg, rgba(255,0,128,0.1) 0%, rgba(0,255,255,0.05) 100%)",
  },
  ocean: {
    bg: "linear-gradient(135deg, #0c1929 0%, #0a2540 50%, #0d3b66 100%)",
    card: "linear-gradient(180deg, rgba(0,150,255,0.1) 0%, rgba(0,255,200,0.05) 100%)",
  },
  midnight: {
    bg: "linear-gradient(135deg, #0a0a0f 0%, #141428 50%, #1a1a2e 100%)",
    card: "linear-gradient(180deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.05) 100%)",
  },
  sunset: {
    bg: "linear-gradient(135deg, #1a0a0a 0%, #2d1f1f 50%, #3d2020 100%)",
    card: "linear-gradient(180deg, rgba(255,100,50,0.1) 0%, rgba(255,50,100,0.05) 100%)",
  },
  forest: {
    bg: "linear-gradient(135deg, #0a1a0a 0%, #0f2a0f 50%, #1a3d1a 100%)",
    card: "linear-gradient(180deg, rgba(50,255,100,0.1) 0%, rgba(0,200,150,0.05) 100%)",
  },
  neon: {
    bg: "linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a1a1a 100%)",
    card: "linear-gradient(180deg, rgba(0,255,0,0.1) 0%, rgba(255,0,255,0.05) 100%)",
  },
};

const CodePreview = forwardRef<CodePreviewHandle, CodePreviewProps>(
  ({ code, theme, typingDelay = 40, isAnimating = false, showWatermark = false }, ref) => {
    const [displayedChars, setDisplayedChars] = useState(code.length);
    const [animationComplete, setAnimationComplete] = useState(true);

    const themeStyles = themeGradients[theme] || themeGradients.midnight;

    useImperativeHandle(ref, () => ({
      startAnimation: async () => {
        setDisplayedChars(0);
        setAnimationComplete(false);
        
        const totalChars = code.length;

        return new Promise<void>((resolve) => {
          let currentChar = 0;
          const interval = setInterval(() => {
            currentChar++;
            setDisplayedChars(currentChar);
            
            if (currentChar >= totalChars) {
              clearInterval(interval);
              setAnimationComplete(true);
              setTimeout(resolve, 500);
            }
          }, typingDelay);
        });
      },
      resetAnimation: () => {
        setDisplayedChars(code.length);
        setAnimationComplete(true);
      },
    }));

    // Reset display when code changes
    useEffect(() => {
      if (!isAnimating) {
        setDisplayedChars(code.length);
      }
    }, [code, isAnimating]);

    const displayedCode = code.slice(0, displayedChars);
    const showCursor = !animationComplete;

    return (
      <div
        className="w-full h-full flex items-center justify-center p-4 relative"
        style={{ background: themeStyles.bg }}
      >
        <div
          className="w-full rounded-xl p-4 border border-white/10 shadow-2xl backdrop-blur-sm"
          style={{ background: themeStyles.card }}
        >
          {/* Window controls */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30"></div>
            <span className="text-[10px] text-white/40 ml-2 font-mono">snippet.js</span>
          </div>

          {/* Code content with typewriter */}
          <pre className="text-[11px] font-mono leading-relaxed text-white/90 whitespace-pre-wrap break-words min-h-[100px]">
            <code>
              {displayedCode}
              {showCursor && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="inline-block w-[2px] h-[14px] bg-white ml-[1px] align-middle"
                />
              )}
            </code>
          </pre>
        </div>

        {/* Watermark - only shown in exported video for free users */}
        {showWatermark && (
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
            <span className="text-[9px] text-white/60 font-medium">Made with SnippetMotion</span>
          </div>
        )}
      </div>
    );
  }
);

CodePreview.displayName = "CodePreview";

export default CodePreview;
