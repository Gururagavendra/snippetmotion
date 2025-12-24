import { motion } from "framer-motion";

const showcaseItems = [
  {
    id: 1,
    label: "React Hooks",
    lang: "JavaScript",
    gradient: "from-yellow-400 to-yellow-600",
    code: `const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debounced;
};`,
  },
  {
    id: 2,
    label: "Data Science",
    lang: "Python",
    gradient: "from-blue-400 to-yellow-500",
    code: `import pandas as pd
import numpy as np

df = pd.read_csv('data.csv')
df['normalized'] = (df['value'] - df['value'].mean()) / df['value'].std()

print(df.describe())`,
  },
  {
    id: 3,
    label: "System Utils",
    lang: "Rust",
    gradient: "from-orange-500 to-red-600",
    code: `use std::fs;
use std::io::Result;

fn main() -> Result<()> {
    let contents = fs::read_to_string("config.toml")?;
    let config: Config = toml::from_str(&contents)?;
    println!("{:?}", config);
    Ok(())
}`,
  },
  {
    id: 4,
    label: "Styling",
    lang: "CSS",
    gradient: "from-blue-500 to-pink-500",
    code: `.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  transition: transform 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
}`,
  },
];

const langIcons: Record<string, string> = {
  JavaScript: "JS",
  Python: "PY",
  Rust: "RS",
  CSS: "CSS",
};

const CodePreview = ({ item }: { item: typeof showcaseItems[0] }) => {
  return (
    <div className="w-64 aspect-[9/16] rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-primary/50 transition-all duration-300 group hover:scale-105">
      {/* Phone frame */}
      <div className="h-full flex flex-col p-3">
        {/* Notch */}
        <div className="flex justify-center mb-2">
          <div className="w-12 h-2 rounded-full bg-muted"></div>
        </div>
        
        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Code window */}
          <div className="flex-1 bg-secondary/80 rounded-lg overflow-hidden">
            {/* Window controls */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/30">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-[10px] text-muted-foreground ml-2 font-mono">{item.lang.toLowerCase()}</span>
            </div>
            
            {/* Code content with gradient overlay */}
            <div className="relative p-3 h-full">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
              <pre className="text-[8px] font-mono leading-relaxed text-foreground/90 overflow-hidden relative z-10">
                <code className="whitespace-pre-wrap break-all">
                  {item.code.split('\n').slice(0, 10).map((line, i) => (
                    <div key={i} className="flex">
                      <span className="text-muted-foreground/50 w-3 mr-2 select-none">{i + 1}</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </code>
              </pre>
              
              {/* Typing cursor animation */}
              <motion.div
                className={`absolute bottom-4 left-6 w-1.5 h-3 bg-gradient-to-b ${item.gradient} rounded-sm`}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            </div>
          </div>
        </div>
        
        {/* Footer - Use case label instead of username */}
        <div className="mt-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
              <span className="text-[9px] font-bold text-white">{langIcons[item.lang]}</span>
            </div>
            <span className="text-xs font-medium text-foreground">
              {item.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Showcase = () => {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for <span className="text-gradient">Every Stack</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            From frontend frameworks to systems programming — create stunning videos for any language.
          </p>
        </motion.div>
      </div>

      {/* Cards Grid */}
      <div className="relative px-6">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex justify-center gap-6 flex-wrap md:flex-nowrap overflow-x-auto pb-4 scrollbar-hide">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0"
            >
              <CodePreview item={item} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Simple stat - only languages supported (honest) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="container mx-auto px-6 mt-16"
      >
        <div className="flex justify-center">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-gradient">15+</p>
            <p className="text-sm text-muted-foreground mt-1">Languages Supported</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Showcase;
