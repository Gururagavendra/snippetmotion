import { ReactNode } from "react";

interface MacWindowMockupProps {
  children: ReactNode;
  aspectRatio: "square" | "landscape";
}

const MacWindowMockup = ({ children, aspectRatio }: MacWindowMockupProps) => {
  // Dimensions optimized for each platform
  const dimensions = {
    square: { width: 400, height: 400 },      // Instagram/Twitter
    landscape: { width: 560, height: 315 },   // YouTube/LinkedIn (16:9)
  };

  const { width, height } = dimensions[aspectRatio];

  return (
    <div
      className="relative mx-auto flex-shrink-0 rounded-lg overflow-hidden shadow-2xl"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* macOS Window Frame */}
      <div className="relative w-full h-full bg-[#1e1e1e] flex flex-col">
        {/* Title Bar */}
        <div className="h-8 bg-gray-800 flex items-center px-3 shrink-0">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 transition-colors" />
            <div className="w-3 h-3 rounded-full bg-[#27ca3f] hover:bg-[#27ca3f]/80 transition-colors" />
          </div>
          {/* Window Title */}
          <span className="flex-1 text-center text-xs text-white/40 font-medium -ml-14">
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

