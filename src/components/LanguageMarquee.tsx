import { motion } from "framer-motion";

const languages = [
  { name: "JavaScript", abbr: "JS", color: "#F7DF1E" },
  { name: "TypeScript", abbr: "TS", color: "#3178C6" },
  { name: "Python", abbr: "PY", color: "#3776AB" },
  { name: "Java", abbr: "JV", color: "#ED8B00" },
  { name: "C++", abbr: "C++", color: "#00599C" },
  { name: "Go", abbr: "GO", color: "#00ADD8" },
  { name: "Rust", abbr: "RS", color: "#CE422B" },
  { name: "Swift", abbr: "SW", color: "#FA7343" },
  { name: "PHP", abbr: "PHP", color: "#777BB4" },
  { name: "Ruby", abbr: "RB", color: "#CC342D" },
];

const LanguageMarquee = () => {
  // Duplicate for seamless loop
  const duplicatedLanguages = [...languages, ...languages, ...languages];

  return (
    <section className="py-12 overflow-hidden">
      <div className="container mx-auto px-6 mb-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground tracking-wide"
        >
          Supports 15+ Languages & Frameworks
        </motion.p>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

        {/* Marquee track */}
        <div className="flex animate-marquee-slow">
          {duplicatedLanguages.map((lang, index) => (
            <div
              key={`${lang.name}-${index}`}
              className="flex-shrink-0 mx-6 group cursor-pointer"
            >
              <div 
                className="px-5 py-3 rounded-xl border border-border/30 bg-card/20 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card/40 hover:scale-105"
              >
                {/* Language name */}
                <span 
                  className="text-sm font-medium text-muted-foreground transition-colors duration-300"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = lang.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '';
                  }}
                >
                  {lang.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LanguageMarquee;
