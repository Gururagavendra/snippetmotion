import { motion } from "framer-motion";
import { Palette, Zap, Rocket } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Beautiful Themes",
    description: "Choose from 10+ studio-grade themes designed by professionals.",
    gradient: "from-primary to-cyan-400",
  },
  {
    icon: Zap,
    title: "Instant Export",
    description: "Render 60fps MP4s directly in your browser. No cloud needed.",
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    icon: Rocket,
    title: "Social Ready",
    description: "Perfect 9:16 aspect ratio for Reels, Shorts, and TikTok.",
    gradient: "from-accent to-pink-400",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="text-gradient">go viral</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Built by a developer, for developers who want to share their code beautifully.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="glass rounded-2xl p-8 h-full border border-border/50 hover:border-primary/50 transition-colors">
                <div 
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-background" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
