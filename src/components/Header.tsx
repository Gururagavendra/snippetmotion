import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePricing } from "@/contexts/PricingContext";
import PricingModal from "@/components/PricingModal";

const Header = () => {
  const { isPricingOpen, setIsPricingOpen, isPro } = usePricing();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToFeatures = () => {
    setIsMobileMenuOpen(false);
    // Small delay to ensure menu closes before scrolling
    setTimeout(() => {
      const section = document.getElementById("use-cases");
      if (section) {
        const headerOffset = 80; // Account for fixed header
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  const scrollToFeedback = () => {
    setIsMobileMenuOpen(false);
    // Small delay to ensure menu closes before scrolling
    setTimeout(() => {
      const section = document.getElementById("feedback");
      if (section) {
        const headerOffset = 80; // Account for fixed header
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 100);
  };

  const handlePricing = () => {
    setIsPricingOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-background" />
            </div>
            <span className="text-xl font-bold text-gradient">SnippetMotion</span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={scrollToFeatures}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button 
              onClick={handlePricing}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={scrollToFeedback}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Feedback
            </button>
            {isPro ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Pro Active</span>
              </div>
            ) : (
              <Button 
                onClick={handlePricing}
                className="bg-gradient-to-r from-primary to-accent text-background font-semibold px-6 btn-glow hover:opacity-90 transition-opacity"
              >
                Go Pro
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-xl relative z-50"
            >
              <nav className="flex flex-col p-4 gap-2">
                <button 
                  onClick={scrollToFeatures}
                  className="text-left py-3 px-4 text-foreground hover:bg-muted/50 rounded-lg transition-colors touch-manipulation"
                  type="button"
                >
                  Features
                </button>
                <button 
                  onClick={handlePricing}
                  className="text-left py-3 px-4 text-foreground hover:bg-muted/50 rounded-lg transition-colors touch-manipulation"
                  type="button"
                >
                  Pricing
                </button>
                <button 
                  onClick={scrollToFeedback}
                  className="text-left py-3 px-4 text-foreground hover:bg-muted/50 rounded-lg transition-colors touch-manipulation"
                  type="button"
                >
                  Feedback
                </button>
                {isPro ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Pro Active</span>
                  </div>
                ) : (
                  <Button 
                    onClick={handlePricing}
                    className="w-full bg-gradient-to-r from-primary to-accent text-background font-semibold btn-glow hover:opacity-90 transition-opacity mt-2"
                  >
                    Go Pro
                  </Button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <PricingModal open={isPricingOpen} onOpenChange={setIsPricingOpen} />
    </>
  );
};

export default Header;
