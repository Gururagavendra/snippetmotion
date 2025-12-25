import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Lock, ArrowRight, ArrowLeft, Sparkles, CreditCard, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePricing } from "@/contexts/PricingContext";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const features = [
  { text: 'Remove "Made with SnippetMotion" Watermark' },
  { text: "Export in Crystal Clear 1080p & 4K", highlight: "1080p & 4K" },
  { text: "Unlock all Premium Themes (Cyberpunk, Synthwave)", highlight: "(Cyberpunk, Synthwave)" },
  { text: "Support Indie Development", emoji: "❤️" },
];

const PricingModal = ({ open, onOpenChange }: PricingModalProps) => {
  const [view, setView] = useState<"pricing" | "activation" | "success">("pricing");
  const [licenseInput, setLicenseInput] = useState("");
  const [error, setError] = useState("");
  const { activateLicense } = usePricing();

  const handleActivate = () => {
    if (!licenseInput.trim()) {
      setError("Please enter a license key");
      return;
    }
    
    const success = activateLicense(licenseInput);
    if (success) {
      setError("");
      setView("success");
      setTimeout(() => {
        onOpenChange(false);
        setView("pricing");
        setLicenseInput("");
      }, 2000);
    } else {
      setError("Invalid license key. Please check and try again.");
    }
  };

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setView("pricing");
      setLicenseInput("");
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-md bg-card border-border/50 p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === "pricing" && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5"
            >
              <DialogHeader className="space-y-2 mb-4">
                {/* Launch Special Badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                    <span className="text-xs">🎉</span>
                    <span className="text-xs font-semibold text-primary tracking-wide">LAUNCH SPECIAL</span>
                  </div>
                </div>

                {/* Headline */}
                <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground">
                  Get Lifetime Access (Early Bird)
                </h2>
                <p className="text-center text-sm text-muted-foreground">
                  Join the first 100 users and lock in Pro features forever.
                </p>
              </DialogHeader>

              {/* Value Badge */}
              <div className="flex justify-center mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(220,50%,15%)] border border-primary/40 shadow-[0_0_8px_hsl(var(--primary)/0.3)]">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-foreground">Lifetime License — Pay Once, Use Forever</span>
                </div>
              </div>

              {/* Social Proof */}
              <p className="text-center text-xs text-muted-foreground mb-4">
                Join dozens of developers already creating viral content.
              </p>

              {/* Pricing */}
              <div className="text-center mb-4">
                <span className="text-sm text-muted-foreground line-through mr-2">$29.00</span>
                <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">$9.99</span>
                <span className="text-sm text-muted-foreground ml-1">/ one-time</span>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50 mb-4"></div>

              {/* Features */}
              <ul className="space-y-2.5 mb-5">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-background" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {feature.highlight ? (
                        <>
                          {feature.text.split(feature.highlight)[0]}
                          <span className="text-foreground font-medium">{feature.highlight}</span>
                          {feature.text.split(feature.highlight)[1]}
                        </>
                      ) : (
                        feature.text
                      )}
                      {feature.emoji && <span className="ml-1">{feature.emoji}</span>}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button 
                asChild
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent text-background btn-glow hover:opacity-90 transition-opacity group"
              >
                <a href="https://guruvelu.gumroad.com/l/bbbve" target="_blank" rel="noopener noreferrer">
                  Claim Lifetime Deal - $9.99
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>

              {/* Security Note with Payment Icons */}
              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>30-day money-back guarantee. Secure checkout.</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  {/* Visa */}
                  <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="32" rx="4" fill="currentColor" className="text-muted-foreground/20"/>
                    <path d="M19.5 21H17L18.75 11H21.25L19.5 21ZM15.5 11L13.1 18.1L12.8 16.7L12.8 16.7L11.9 12C11.9 12 11.8 11 10.5 11H6.1L6 11.3C6 11.3 7.5 11.6 9.2 12.6L11.4 21H14L18 11H15.5ZM35.5 21H38L35.8 11H33.8C32.7 11 32.4 11.8 32.4 11.8L28.5 21H31L31.5 19.5H34.6L35 21H35.5ZM32.2 17.5L33.6 13.5L34.4 17.5H32.2ZM29.5 14.5L29.9 12.2C29.9 12.2 28.6 11.7 27.2 11.7C25.7 11.7 22.5 12.4 22.5 15.2C22.5 17.8 26.1 17.8 26.1 19.2C26.1 20.6 22.9 20.2 21.7 19.3L21.3 21.7C21.3 21.7 22.6 22.3 24.5 22.3C26.4 22.3 29.5 21.2 29.5 18.6C29.5 15.9 25.9 15.6 25.9 14.4C25.9 13.2 28.3 13.4 29.5 14.5Z" fill="currentColor" className="text-muted-foreground"/>
                  </svg>
                  {/* Mastercard */}
                  <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="32" rx="4" fill="currentColor" className="text-muted-foreground/20"/>
                    <circle cx="20" cy="16" r="8" fill="currentColor" className="text-muted-foreground/60"/>
                    <circle cx="28" cy="16" r="8" fill="currentColor" className="text-muted-foreground/40"/>
                  </svg>
                  {/* PayPal */}
                  <svg className="h-5 w-auto" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="32" rx="4" fill="currentColor" className="text-muted-foreground/20"/>
                    <path d="M20 10H24C26.5 10 28 11.5 28 14C28 16.5 26 18 24 18H22L21 22H18L20 10ZM23 15.5C24 15.5 25 15 25 14C25 13 24.5 12.5 23.5 12.5H22.5L22 15.5H23Z" fill="currentColor" className="text-muted-foreground"/>
                    <path d="M27 12H31C33.5 12 35 13.5 35 16C35 18.5 33 20 31 20H29L28 24H25L27 12ZM30 17.5C31 17.5 32 17 32 16C32 15 31.5 14.5 30.5 14.5H29.5L29 17.5H30Z" fill="currentColor" className="text-muted-foreground/60"/>
                  </svg>
                  {/* Generic Card */}
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* License Key Link */}
              <p className="text-center mt-3 text-xs text-muted-foreground">
                Already purchased?{" "}
                <button 
                  onClick={() => setView("activation")}
                  className="text-foreground font-medium hover:text-primary transition-colors"
                >
                  Enter License Key
                </button>
              </p>
            </motion.div>
          )}

          {view === "activation" && (
            <motion.div
              key="activation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5"
            >
              <DialogHeader className="space-y-3 mb-6">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Lock className="w-6 h-6 text-background" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground">
                  Activate Pro License
                </h2>
                <p className="text-center text-sm text-muted-foreground">
                  Check your email receipt from Lemon Squeezy for your license code.
                </p>
              </DialogHeader>

              <div className="space-y-3 mb-6">
                <Input
                  value={licenseInput}
                  onChange={(e) => {
                    setLicenseInput(e.target.value);
                    setError("");
                  }}
                  placeholder="e.g. SNIPPET-VIP"
                  className="h-11 text-center text-base font-mono uppercase tracking-wider"
                />
                {error && (
                  <p className="text-xs text-destructive text-center">{error}</p>
                )}
              </div>

              <Button 
                onClick={handleActivate}
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-accent text-background btn-glow hover:opacity-90 transition-opacity"
              >
                Activate
              </Button>

              <button 
                onClick={() => {
                  setView("pricing");
                  setError("");
                  setLicenseInput("");
                }}
                className="w-full mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Pricing
              </button>
            </motion.div>
          )}

          {view === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="p-4 sm:p-5 flex flex-col items-center justify-center min-h-[300px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4"
              >
                <Sparkles className="w-8 h-8 text-background" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl sm:text-2xl font-bold text-center text-foreground mb-2"
              >
                Welcome to Pro! 🎉
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center text-sm text-muted-foreground"
              >
                All premium features are now unlocked.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default PricingModal;
