import { motion } from "framer-motion";
import { Play, Rocket, GraduationCap } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const useCases = [
  {
    icon: Play,
    title: "For Dev Influencers",
    description: "Stop spending hours in After Effects. Turn your daily coding tips into professional, algorithm-friendly Reels and TikToks in under 30 seconds. Consistency made easy."
  },
  {
    icon: Rocket,
    title: "For Indie Hackers & Builders",
    description: "Launching a new library or SaaS? Don't just tweet the GitHub link. Show a 10-second typing video of the setup or 'Aha!' moment. Show, don't just tell."
  },
  {
    icon: GraduationCap,
    title: "For Job Seekers & Learners",
    description: "Stand out in the LinkedIn feed. Don't just list skills on your resume; post slick videos of complex algorithms or hooks you just mastered. Impress recruiters visually."
  }
];

const UseCaseCard = ({ useCase, index }: { useCase: typeof useCases[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.15 }}
    viewport={{ once: true }}
    className="group h-full"
  >
    <div className="relative h-full p-8 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/30 transition-all duration-500 hover:-translate-y-2 hover:border-primary/50 hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]">
      {/* Gradient glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        {/* Icon with gradient */}
        <div className="mb-6 inline-flex p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20">
          <useCase.icon className="w-8 h-8 text-gradient-icon" style={{
            stroke: "url(#icon-gradient)",
          }} />
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4 group-hover:text-gradient transition-all duration-300">
          {useCase.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {useCase.description}
        </p>
      </div>
    </div>
  </motion.div>
);

const UseCases = () => {
  return (
    <section id="use-cases" className="relative py-24 px-6 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>
      
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Supercharge Your Social Presence.{" "}
            <span className="text-gradient">Fast.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Whether you're building a brand, marketing a library, or just showing off cool code, 
            SnippetMotion is my gift to help you create viral videos.
          </p>
        </motion.div>

        {/* Desktop: Cards Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <UseCaseCard key={useCase.title} useCase={useCase} index={index} />
          ))}
        </div>

        {/* Mobile: Swipeable Carousel */}
        <div className="md:hidden">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {useCases.map((useCase, index) => (
                <CarouselItem key={useCase.title} className="pl-4 basis-[85%]">
                  <UseCaseCard useCase={useCase} index={index} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-6">
              <CarouselPrevious className="static translate-y-0 bg-card/50 border-border/50 hover:bg-card" />
              <CarouselNext className="static translate-y-0 bg-card/50 border-border/50 hover:bg-card" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
