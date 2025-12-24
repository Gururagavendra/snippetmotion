import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PricingContextType {
  isPricingOpen: boolean;
  setIsPricingOpen: (open: boolean) => void;
  isPro: boolean;
  licenseKey: string | null;
  activateLicense: (key: string) => boolean;
  clearLicense: () => void;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

// Valid license keys (in production, this would be validated server-side)
const VALID_KEYS = ["SNIPPET-VIP", "SNIPPET-PRO", "SNIPPET-LAUNCH"];

export const PricingProvider = ({ children }: { children: ReactNode }) => {
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);

  // Load license from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("snippetmotion_license");
    if (storedKey && VALID_KEYS.includes(storedKey.toUpperCase())) {
      setLicenseKey(storedKey.toUpperCase());
    }
  }, []);

  const isPro = licenseKey !== null;

  const activateLicense = (key: string): boolean => {
    const normalizedKey = key.toUpperCase().trim();
    if (VALID_KEYS.includes(normalizedKey)) {
      setLicenseKey(normalizedKey);
      localStorage.setItem("snippetmotion_license", normalizedKey);
      return true;
    }
    return false;
  };

  const clearLicense = () => {
    setLicenseKey(null);
    localStorage.removeItem("snippetmotion_license");
  };

  return (
    <PricingContext.Provider
      value={{
        isPricingOpen,
        setIsPricingOpen,
        isPro,
        licenseKey,
        activateLicense,
        clearLicense,
      }}
    >
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error("usePricing must be used within a PricingProvider");
  }
  return context;
};
