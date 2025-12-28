import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="container mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/50 mb-8"
        >
          <Play className="w-3 h-3 text-primary fill-primary" />
          <span className="text-sm text-muted-foreground">
            Create stunning code videos
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
        >
          Stop posting
          <br />
          static screenshots.
          <br />
          <span className="text-gradient">Create cinematic code</span>
          <br />
          that stop the scroll.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          The fastest way to create stunning code animations. No video editing skills required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <a 
            href="#editor"
            className="group flex items-center gap-2 text-primary hover:text-accent transition-colors"
          >
            <span className="text-sm font-medium">Try it now (No login required)</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowDown className="w-4 h-4" />
            </motion.div>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
