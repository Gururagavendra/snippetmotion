import { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
}

const PhoneMockup = ({ children }: PhoneMockupProps) => {
  return (
    <div className="relative w-[280px] h-[580px] mx-auto flex-shrink-0">
      {/* Phone Frame - Ultra thin bezel like iPhone 16 */}
      <div className="relative w-full h-full bg-[#1c1c1e] rounded-[44px] p-[4px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6),0_30px_60px_-30px_rgba(0,0,0,0.5)]">
        {/* Glass reflection overlay */}
        <div className="absolute inset-[4px] rounded-[40px] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none z-20" />
        
        {/* Screen container */}
        <div className="relative w-full h-full bg-black rounded-[40px] overflow-hidden">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-12 px-6 flex items-center justify-between z-30">
            {/* Time */}
            <span className="text-white text-sm font-semibold">9:41</span>
            
            {/* Small Camera Pill (Dynamic Island style) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-3">
              <div className="w-[85px] h-[24px] bg-black rounded-full flex items-center justify-center gap-2">
                {/* Camera lens */}
                <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] ring-[1px] ring-[#3a3a3a]" />
              </div>
            </div>
            
            {/* Status icons */}
            <div className="flex items-center gap-1">
              {/* Signal bars */}
              <div className="flex items-end gap-[1.5px]">
                <div className="w-[2.5px] h-[4px] bg-white rounded-[0.5px]" />
                <div className="w-[2.5px] h-[6px] bg-white rounded-[0.5px]" />
                <div className="w-[2.5px] h-[8px] bg-white rounded-[0.5px]" />
                <div className="w-[2.5px] h-[10px] bg-white rounded-[0.5px]" />
              </div>
              {/* Wifi */}
              <svg className="w-3.5 h-3.5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0-4c2.2 0 4 1.8 4 4h-2c0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.2 1.8-4 4-4zm0-4c3.3 0 6 2.7 6 6h-2c0-2.2-1.8-4-4-4s-4 1.8-4 4H6c0-3.3 2.7-6 6-6z"/>
              </svg>
              {/* Battery */}
              <div className="flex items-center ml-0.5">
                <div className="w-5 h-2.5 border border-white/80 rounded-[2px] p-[1.5px] relative">
                  <div className="w-full h-full bg-white rounded-[0.5px]" />
                </div>
                <div className="w-[1.5px] h-[4px] bg-white/80 rounded-r-sm ml-[0.5px]" />
              </div>
            </div>
          </div>
          
          {/* Screen content */}
          <div className="w-full h-full pt-12 overflow-hidden">
            {children}
          </div>
          
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full z-30" />
        </div>
        
        {/* Side buttons - very subtle */}
        <div className="absolute -left-[1.5px] top-[90px] w-[2px] h-6 bg-[#2a2a2c] rounded-l-sm" />
        <div className="absolute -left-[1.5px] top-[120px] w-[2px] h-12 bg-[#2a2a2c] rounded-l-sm" />
        <div className="absolute -left-[1.5px] top-[170px] w-[2px] h-12 bg-[#2a2a2c] rounded-l-sm" />
        
        {/* Power button */}
        <div className="absolute -right-[1.5px] top-[140px] w-[2px] h-16 bg-[#2a2a2c] rounded-r-sm" />
      </div>
    </div>
  );
};

export default PhoneMockup;
