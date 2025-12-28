import { forwardRef, useEffect, useState, useImperativeHandle, useMemo } from "react";
import { motion } from "framer-motion";
import hljs from "highlight.js";

export interface CodePreviewHandle {
  startAnimation: () => Promise<void>;
  resetAnimation: () => void;
}

interface CodePreviewProps {
  code: string;
  theme: string;
  language?: string;
  aspectRatio?: "portrait" | "square" | "landscape";
  typingDelay?: number;
  isAnimating?: boolean;
  showWatermark?: boolean;
  pausedLineIndices?: number[];
  pauseDuration?: number;
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

// Map our language values to highlight.js language names
const languageMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  css: "css",
  html: "xml",
  java: "java",
  cpp: "cpp",
  csharp: "csharp",
  go: "go",
  rust: "rust",
  swift: "swift",
  kotlin: "kotlin",
  php: "php",
  sql: "sql",
  json: "json",
  yaml: "yaml",
  bash: "bash",
  markdown: "markdown",
};

const CodePreview = forwardRef<CodePreviewHandle, CodePreviewProps>(
  ({ code, theme, language = "javascript", aspectRatio = "portrait", typingDelay = 40, isAnimating = false, showWatermark = false, pausedLineIndices = [], pauseDuration = 1500 }, ref) => {
    const [displayedChars, setDisplayedChars] = useState(code.length);
    const [animationComplete, setAnimationComplete] = useState(true);

    const themeStyles = themeGradients[theme] || themeGradients.midnight;
    
    // Get highlighted HTML for the displayed code
    const highlightedCode = useMemo(() => {
      const displayedCode = code.slice(0, displayedChars);
      
      try {
        // Use auto-detection if "auto" is selected
        if (language === "auto") {
          return hljs.highlightAuto(displayedCode).value;
        }
        
        const hljsLang = languageMap[language] || "plaintext";
        const result = hljs.highlight(displayedCode, { language: hljsLang, ignoreIllegals: true });
        return result.value;
      } catch {
        // Fallback to auto-detection if language isn't registered
        try {
          const result = hljs.highlightAuto(displayedCode);
          return result.value;
        } catch {
          return displayedCode;
        }
      }
    }, [code, displayedChars, language]);

    // Sleep utility
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    useImperativeHandle(ref, () => ({
      startAnimation: async () => {
        setDisplayedChars(0);
        setAnimationComplete(false);
        
        const totalChars = code.length;
        let currentChar = 0;
        let currentLineIndex = 0;

        // Use async loop instead of setInterval to allow for variable delays (pauses)
        while (currentChar < totalChars) {
          const char = code[currentChar];
          currentChar++;
          setDisplayedChars(currentChar);

          // Check if we just typed a newline
          if (char === '\n') {
            // We just completed line at currentLineIndex
            if (pausedLineIndices.includes(currentLineIndex)) {
              // Pause the animation for the configured duration
              await sleep(pauseDuration);
            }
            currentLineIndex++;
          }

          // Wait for the normal typing delay
          await sleep(typingDelay);
        }

        setAnimationComplete(true);
        await sleep(500);
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

    const showCursor = !animationComplete;

    // Show code card with traffic lights only for portrait (phone mockup)
    // For square/landscape, MacWindowMockup already has traffic lights
    const showCodeCard = aspectRatio === "portrait";

    return (
      <div
        className={`w-full h-full flex ${showCodeCard ? 'items-center justify-center p-4' : 'items-start p-3 sm:p-6'} relative`}
        style={{ background: themeStyles.bg }}
      >
        {showCodeCard ? (
          /* Code card with traffic lights - for portrait/phone mockup */
          <div
            className="w-full rounded-xl p-4 border border-white/10 shadow-2xl backdrop-blur-sm"
            style={{ background: themeStyles.card }}
          >
            {/* Window controls - traffic lights */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30"></div>
              <span className="text-[10px] text-white/40 ml-2 font-mono">snippet.js</span>
            </div>

            {/* Code content with typewriter and syntax highlighting */}
            <pre className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words min-h-[100px]">
              <code 
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
              {showCursor && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="inline w-[2px] bg-white ml-[1px] border-l-2 border-white"
                />
              )}
            </pre>
          </div>
        ) : (
          /* Code directly on background - for square/landscape (MacWindowMockup has its own chrome) */
          <pre className="text-[10px] sm:text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-words">
            <code 
              className="hljs"
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
            {showCursor && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="inline w-[2px] bg-white ml-[1px] border-l-2 border-white"
              />
            )}
          </pre>
        )}

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
