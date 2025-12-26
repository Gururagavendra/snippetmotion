import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, Play, Clock, Film, ImageIcon } from "lucide-react";
import PhoneMockup from "@/components/PhoneMockup";
import CodePreview, { CodePreviewHandle } from "@/components/CodePreview";
import { useVideoExport } from "@/hooks/useVideoExport";
import { Progress } from "@/components/ui/progress";
import { usePricing } from "@/contexts/PricingContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const themes = [
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "ocean", label: "Ocean" },
  { value: "midnight", label: "Midnight" },
  { value: "sunset", label: "Sunset" },
  { value: "forest", label: "Forest" },
  { value: "neon", label: "Neon" },
];

const durations = [
  { value: "long", label: "Long (~8s)", durationMs: 8000 },
  { value: "medium", label: "Medium (~4s)", durationMs: 4000 },
  { value: "short", label: "Short (~1.5s)", durationMs: 1500 },
];

const languages = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "CSS", value: "css" },
  { label: "HTML", value: "html" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Swift", value: "swift" },
  { label: "Kotlin", value: "kotlin" },
  { label: "PHP", value: "php" },
  { label: "SQL", value: "sql" },
  { label: "JSON", value: "json" },
  { label: "YAML", value: "yaml" },
  { label: "Bash/Shell", value: "bash" },
  { label: "Markdown", value: "markdown" },
];

type ExportFormat = "mp4" | "gif";

const CodeEditor = () => {
  const [code, setCode] = useState(`function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));`);
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("cyberpunk");
  const [duration, setDuration] = useState("medium");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("mp4");
  const [isAnimating, setIsAnimating] = useState(false);
  const { isPro, setIsPricingOpen } = usePricing();
  
  const previewRef = useRef<CodePreviewHandle>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const { exportVideo, exportGif, isExporting, progress } = useVideoExport({ fps: 30 });

  const handlePreview = async () => {
    if (previewRef.current) {
      setIsAnimating(true);
      await previewRef.current.startAnimation();
      setIsAnimating(false);
    }
  };

  const handleExport = async () => {
    if (!previewRef.current || !previewContainerRef.current) return;
    
    setIsAnimating(true);
    
    // Calculate typing delay based on target video duration
    const selectedDuration = durations.find(d => d.value === duration);
    const targetDurationMs = selectedDuration?.durationMs || 4000; // Default to medium
    const holdTime = 500; // Hold final frame for 500ms
    const animationTime = targetDurationMs - holdTime;
    const typingDelay = Math.max(10, Math.floor(animationTime / code.length));
    
    const exportFn = exportFormat === "gif" ? exportGif : exportVideo;
    
    await exportFn(
      previewContainerRef.current,
      async () => {
        if (previewRef.current) {
          await previewRef.current.startAnimation();
        }
      },
      targetDurationMs
    );
    setIsAnimating(false);
  };

  return (
    <section id="editor" className="py-16 px-0 sm:px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl glow-border animate-glow-pulse bg-card p-1"
        >
          <div className="bg-card rounded-xl overflow-hidden">
            <div className="grid lg:grid-cols-[380px_1fr] gap-0">
              {/* Left: Controls */}
              <div className="px-3 py-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-border/50">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2 text-gradient">
                    SnippetMotion
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Transform your code into stunning videos
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Code
                    </label>
                    <Textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="min-h-[220px] font-mono text-sm bg-secondary border-border/50 resize-none focus:ring-primary"
                      placeholder="Paste your code here..."
                      disabled={isAnimating || isExporting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Language
                      </label>
                      <Select value={language} onValueChange={setLanguage} disabled={isAnimating || isExporting}>
                        <SelectTrigger className="bg-secondary border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Theme
                      </label>
                      <Select value={theme} onValueChange={setTheme} disabled={isAnimating || isExporting}>
                        <SelectTrigger className="bg-secondary border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {themes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Duration
                      </label>
                      <Select value={duration} onValueChange={setDuration} disabled={isAnimating || isExporting}>
                        <SelectTrigger className="bg-secondary border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map((d) => (
                            <SelectItem key={d.value} value={d.value}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Format Selector */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Format
                    </label>
                    <div className="flex rounded-lg overflow-hidden border border-border/50 bg-secondary">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setExportFormat("mp4")}
                              disabled={isAnimating || isExporting}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium transition-all ${
                                exportFormat === "mp4"
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <Film className="w-4 h-4" />
                              MP4
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Best quality for sharing</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setExportFormat("gif")}
                              disabled={isAnimating || isExporting}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-medium transition-all ${
                                exportFormat === "gif"
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}
                            >
                              <ImageIcon className="w-4 h-4" />
                              GIF
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Perfect for GitHub READMEs & Autoplay</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {progress < 30 && "🎬 Capturing frames..."}
                          {progress >= 30 && progress < 70 && "✨ Recording your magic..."}
                          {progress >= 70 && progress < 95 && "🎯 Almost there..."}
                          {progress >= 95 && `🚀 Finalizing ${exportFormat.toUpperCase()}...`}
                        </span>
                        <span className="text-primary font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handlePreview}
                      disabled={isAnimating || isExporting}
                      variant="outline"
                      className="h-12 border-border/50"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    
                    <Button 
                      onClick={handleExport}
                      disabled={isAnimating || isExporting}
                      className="bg-gradient-to-r from-primary to-accent text-background font-semibold h-12 btn-glow hover:opacity-90 transition-opacity"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          {exportFormat === "gif" ? (
                            <ImageIcon className="w-4 h-4 mr-2" />
                          ) : (
                            <Film className="w-4 h-4 mr-2" />
                          )}
                          Export {exportFormat.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="px-1 py-4 sm:p-8 lg:p-12 bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center min-h-[500px] sm:min-h-[650px] relative overflow-hidden">
                {/* Subtle grid pattern */}
                <div 
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
                                      linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                  }}
                />
                
                {/* Gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative z-10 py-4"
                >
                  <PhoneMockup>
                    <div ref={previewContainerRef} className="w-full h-full relative">
                      <CodePreview
                        ref={previewRef}
                        code={code}
                        theme={theme}
                        typingDelay={(() => {
                          const selectedDuration = durations.find(d => d.value === duration);
                          const targetDurationMs = selectedDuration?.durationMs || 4000;
                          const holdTime = 500;
                          const animationTime = targetDurationMs - holdTime;
                          return Math.max(10, Math.floor(animationTime / code.length));
                        })()}
                        isAnimating={isAnimating}
                        showWatermark={!isPro && isExporting}
                      />
                    </div>
                  </PhoneMockup>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CodeEditor;
