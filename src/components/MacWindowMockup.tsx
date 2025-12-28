import { ReactNode, useEffect, useRef } from "react";

interface MacWindowMockupProps {
  children: ReactNode;
  aspectRatio: "square" | "landscape";
}

const MacWindowMockup = ({ children, aspectRatio }: MacWindowMockupProps) => {
  // Max dimensions optimized for each platform
  const maxDimensions = {
    square: { width: 400, height: 400 },      // Instagram/Twitter
    landscape: { width: 560, height: 315 },   // YouTube/LinkedIn (16:9)
  };

  const desktopDimensions = {
    square: { width: 500, height: 500 },      // Instagram/Twitter - larger on desktop
    landscape: { width: 700, height: 394 },   // YouTube/LinkedIn (16:9) - larger on desktop
  };

  const { width: maxWidth } = maxDimensions[aspectRatio];
  const { width: desktopWidth } = desktopDimensions[aspectRatio];
  const aspectRatioValue = aspectRatio === "square" ? "1 / 1" : "16 / 9";
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        if (window.innerWidth >= 1024) {
          containerRef.current.style.maxWidth = `${desktopWidth}px`;
        } else {
          containerRef.current.style.maxWidth = `${maxWidth}px`;
        }
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [maxWidth, desktopWidth]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex-shrink-0 rounded-lg overflow-hidden shadow-2xl w-full"
      style={{ 
        maxWidth: `${maxWidth}px`,
        aspectRatio: aspectRatioValue,
      }}
    >
      {/* macOS Window Frame */}
      <div className="relative w-full h-full bg-[#1e1e1e] flex flex-col">
        {/* Title Bar */}
        <div className="h-8 bg-gray-800 flex items-center px-3 shrink-0">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-colors" />
            <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 transition-colors" />
            <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-[#27ca3f] hover:bg-[#27ca3f]/80 transition-colors" />
          </div>
          {/* Window Title */}
          <span className="flex-1 text-center text-xs lg:text-sm text-white/40 font-medium -ml-14">
            snippet.js
          </span>
        </div>

        {/* Window Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MacWindowMockup;

