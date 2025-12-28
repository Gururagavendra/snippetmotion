import { ReactNode } from "react";

interface PhoneMockupProps {
  children: ReactNode;
}

const PhoneMockup = ({ children }: PhoneMockupProps) => {
  return (
    <div className="relative w-[280px] h-[580px] lg:w-[340px] lg:h-[700px] mx-auto flex-shrink-0">
      {/* Phone Frame - Black bezel like iPhone */}
      <div className="relative w-full h-full bg-[#1c1c1e] rounded-[44px] p-[4px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6),0_30px_60px_-30px_rgba(0,0,0,0.5)]">
        {/* Glass reflection overlay */}
        <div className="absolute inset-[4px] rounded-[40px] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none z-20" />
        
        {/* Screen container */}
        <div className="relative w-full h-full bg-black rounded-[40px] overflow-hidden">
          {/* Screen content - full bleed, no status bar */}
          <div className="w-full h-full overflow-hidden">
            {children}
          </div>
          
          {/* Dynamic Island only - no status bar */}
          <div className="absolute left-1/2 -translate-x-1/2 top-3 z-30">
            <div className="w-[85px] h-[24px] bg-black rounded-full flex items-center justify-center gap-2">
              {/* Camera lens */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] ring-[1px] ring-[#3a3a3a]" />
            </div>
          </div>
          
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full z-30" />
        </div>
        
        {/* Side buttons - dark */}
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
