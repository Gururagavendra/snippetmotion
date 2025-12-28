import { motion } from "framer-motion";
import { useState, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Download, Loader2, Play, Film, ImageIcon, Circle } from "lucide-react";
import PhoneMockup from "@/components/PhoneMockup";
import MacWindowMockup from "@/components/MacWindowMockup";
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
import hljs from "highlight.js";

const themes = [
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "ocean", label: "Ocean" },
  { value: "midnight", label: "Midnight" },
  { value: "sunset", label: "Sunset" },
  { value: "forest", label: "Forest" },
  { value: "neon", label: "Neon" },
];

const durations = [
  { value: "long", label: "Long (8s)", targetMs: 8000 },
  { value: "medium", label: "Medium (4s)", targetMs: 4000 },
  { value: "short", label: "Short (1.5s)", targetMs: 1500 },
];

const aspectRatios = [
  { value: "portrait", label: "Portrait", ratio: "9:16", description: "TikTok/Reels" },
  { value: "landscape", label: "Landscape", ratio: "16:9", description: "YouTube/LinkedIn" },
] as const;

type AspectRatio = typeof aspectRatios[number]["value"];

const languages = [
  { label: "Auto Detect", value: "auto" },
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
type ExportResolution = "720p" | "1080p" | "4k";

const resolutions = [
  { value: "720p", label: "720p", icon: "", description: "Fastest" },
  { value: "1080p", label: "1080p", icon: "", description: "Fast" },
  { value: "4k", label: "4K", icon: "", description: "High Quality" },
] as const;

const MAX_LINES = 20;

const CodeEditor = () => {
  const [code, setCode] = useState(`function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));`);
  const [language, setLanguage] = useState("auto");
  const [theme, setTheme] = useState("cyberpunk");
  const [duration, setDuration] = useState("medium");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("mp4");
  const [exportResolution, setExportResolution] = useState<ExportResolution>("1080p");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("portrait");
  const [isAnimating, setIsAnimating] = useState(false);
  const [pausedLineIndices, setPausedLineIndices] = useState<number[]>([]);
  const [pauseDuration, setPauseDuration] = useState(1500); // in milliseconds
  const { isPro, setIsPricingOpen } = usePricing();

  // Calculate line count from code
  const lines = useMemo(() => code.split('\n'), [code]);
  const lineCount = lines.length;
  const isLineLimitExceeded = lineCount > MAX_LINES;
  
  // Toggle a line's breakpoint status
  const toggleBreakpoint = useCallback((lineIndex: number) => {
    setPausedLineIndices(prev => 
      prev.includes(lineIndex)
        ? prev.filter(i => i !== lineIndex)
        : [...prev, lineIndex]
    );
  }, []);

  // Clear breakpoints that are beyond current line count when code changes
  useMemo(() => {
    const maxLineIndex = lines.length - 1;
    setPausedLineIndices(prev => prev.filter(i => i <= maxLineIndex));
  }, [lines.length]);
  
  const previewRef = useRef<CodePreviewHandle>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { exportVideo, exportGif, isExporting, progress } = useVideoExport({ 
    fps: 30,
    resolution: exportResolution 
  });

  // Get target duration from selected duration setting
  const targetDuration = useMemo(() => 
    durations.find(d => d.value === duration)?.targetMs || 4000, 
    [duration]
  );
  
  // Calculate typing delay to fit animation within target duration
  // Formula: typingDelay = (targetDuration - breakpointPauses - endBuffer) / code.length
  const typingDelay = useMemo(() => {
    const endBuffer = 500; // End delay in CodePreview
    const breakpointPauseDuration = pausedLineIndices.length * pauseDuration;
    const availableTimeForTyping = targetDuration - breakpointPauseDuration - endBuffer;
    
    // Ensure minimum delay of 5ms and maximum of 200ms per character
    const calculatedDelay = Math.max(5, Math.min(200, availableTimeForTyping / Math.max(1, code.length)));
    return calculatedDelay;
  }, [targetDuration, pausedLineIndices.length, pauseDuration, code.length]);
  
  // The actual animation duration is now the target duration
  const actualAnimationDuration = targetDuration;

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
    
    const exportFn = exportFormat === "gif" ? exportGif : exportVideo;
    
    await exportFn(
      previewContainerRef.current,
      async () => {
        if (previewRef.current) {
          await previewRef.current.startAnimation();
        }
      },
      actualAnimationDuration
    );
    setIsAnimating(false);
  };

  return (
    <section id="editor" className="py-16 px-0 sm:px-6">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl glow-border animate-glow-pulse bg-card p-1"
        >
          <div className="bg-card rounded-xl overflow-hidden">
            <div className="grid lg:grid-cols-[600px_1fr] gap-0">
              {/* Left: Controls */}
              <div className="px-3 py-6 lg:px-10 lg:py-10 border-b lg:border-b-0 lg:border-r border-border/50">
                <div className="mb-6">
                  <h2 className="text-2xl lg:text-3xl font-semibold mb-2 text-gradient">
                    SnippetMotion
                  </h2>
                  <p className="text-base lg:text-lg text-muted-foreground">
                    Transform your code into stunning videos
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-base lg:text-lg font-medium text-foreground mb-2 block">
                      Code
                      {pausedLineIndices.length > 0 && (
                        <span className="ml-2 text-xs text-amber-400">
                          ({pausedLineIndices.length} breakpoint{pausedLineIndices.length > 1 ? 's' : ''})
                        </span>
                      )}
                    </label>
                    {/* Custom Code Editor with Gutter */}
                    <div className="relative rounded-md border border-border/50 bg-secondary overflow-hidden">
                      {/* Scrollable container */}
                      <div className="overflow-y-auto overflow-x-hidden max-h-[320px] min-h-[220px] code-editor-scroll">
                        <div className="flex min-h-full">
                          {/* Gutter - Line Numbers */}
                          <div className="flex flex-col bg-muted/30 border-r border-border/30 select-none shrink-0 sticky left-0 z-10 pt-2 pb-2">
                            {lines.map((_, lineIndex) => (
                              <TooltipProvider key={lineIndex} delayDuration={300}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => !isAnimating && !isExporting && toggleBreakpoint(lineIndex)}
                                      disabled={isAnimating || isExporting}
                                      className={`
                                        flex items-center justify-end gap-1 px-2 py-0 h-[24px] text-xs font-mono
                                        transition-colors cursor-pointer shrink-0
                                        ${pausedLineIndices.includes(lineIndex) 
                                          ? 'text-amber-400 bg-amber-400/10' 
                                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        }
                                        ${isAnimating || isExporting ? 'cursor-not-allowed opacity-50' : ''}
                                      `}
                                    >
                                      {pausedLineIndices.includes(lineIndex) && (
                                        <Circle className="w-2 h-2 fill-amber-400 text-amber-400" />
                                      )}
                                      <span className="w-5 lg:w-6 text-right text-xs lg:text-sm">{lineIndex + 1}</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="text-xs">
                                    {pausedLineIndices.includes(lineIndex) 
                                      ? 'Click to remove breakpoint' 
                                      : 'Click to add breakpoint'
                                    }
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                          {/* Code Input Area with Syntax Highlighting */}
                          <div className="flex-1 relative min-w-0">
                            {/* Highlighted code layer (behind) */}
                            <pre 
                              className="font-mono text-sm lg:text-base p-2 lg:p-3 leading-[24px] whitespace-pre-wrap break-words m-0"
                              aria-hidden="true"
                            >
                              <code 
                                className="hljs"
                                dangerouslySetInnerHTML={{ 
                                  __html: (() => {
                                    try {
                                      if (language === "auto") {
                                        return hljs.highlightAuto(code || " ").value;
                                      }
                                      const langMap: Record<string, string> = {
                                        javascript: "javascript", typescript: "typescript", python: "python",
                                        css: "css", html: "xml", java: "java", cpp: "cpp", csharp: "csharp",
                                        go: "go", rust: "rust", swift: "swift", kotlin: "kotlin", php: "php",
                                        sql: "sql", json: "json", yaml: "yaml", bash: "bash", markdown: "markdown"
                                      };
                                      const hljsLang = langMap[language] || "plaintext";
                                      return hljs.highlight(code || " ", { language: hljsLang, ignoreIllegals: true }).value;
                                    } catch {
                                      return code || " ";
                                    }
                                  })()
                                }}
                              />
                            </pre>
                            {/* Transparent textarea (on top, captures input) */}
                            <textarea
                              ref={textareaRef}
                              value={code}
                              onChange={(e) => setCode(e.target.value)}
                              className="absolute inset-0 w-full h-full font-mono text-sm lg:text-base bg-transparent resize-none focus:outline-none p-2 lg:p-3 leading-[24px] text-transparent caret-white"
                              placeholder="Paste your code here..."
                              disabled={isAnimating || isExporting}
                              spellCheck={false}
                              style={{ caretColor: 'white' }}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Line counter - fixed at bottom right */}
                      <div 
                        className={`absolute bottom-2 right-3 text-xs lg:text-sm font-mono px-2 py-0.5 rounded z-20 ${
                          isLineLimitExceeded 
                            ? 'bg-red-500/90 text-white' 
                            : 'bg-background/80 text-muted-foreground backdrop-blur-sm'
                        }`}
                      >
                        {lineCount}/{MAX_LINES} lines
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-base lg:text-lg font-medium text-foreground mb-2 block">
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
                      <label className="text-base lg:text-lg font-medium text-foreground mb-2 block">
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
                      <label className="text-base lg:text-lg font-medium text-foreground mb-2 block">
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

                    <div>
                      <label className="text-base lg:text-lg font-medium text-foreground mb-2 block">
                        Aspect Ratio
                      </label>
                      <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatio)} disabled={isAnimating || isExporting}>
                        <SelectTrigger className="bg-secondary border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {aspectRatios.map((ar) => (
                            <SelectItem key={ar.value} value={ar.value}>
                              {ar.ratio}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Breakpoint Pause Time Slider */}
                  <div>
                    <label className="text-base lg:text-lg font-medium text-foreground mb-2 block flex items-center justify-between">
                      <span>Breakpoint Pause</span>
                      <span className="text-sm lg:text-base font-normal text-muted-foreground">
                        {(pauseDuration / 1000).toFixed(1)}s
                      </span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">0.5s</span>
                      <Slider
                        value={[pauseDuration]}
                        onValueChange={(values) => setPauseDuration(values[0])}
                        min={500}
                        max={5000}
                        step={500}
                        disabled={isAnimating || isExporting}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground">5s</span>
                    </div>
                    {pausedLineIndices.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Click line numbers to add breakpoints
                      </p>
                    )}
                  </div>

                  {/* Export Settings */}
                  <div className="space-y-3">
                    <label className="text-base lg:text-lg font-medium text-foreground block">
                      Export Settings
                    </label>
                    
                    {/* Format Row */}
                    <div className="flex rounded-lg overflow-hidden border border-border/50 bg-secondary">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setExportFormat("mp4")}
                              disabled={isAnimating || isExporting}
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm lg:text-base font-medium transition-all ${
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
                              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-sm lg:text-base font-medium transition-all ${
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

                    {/* Resolution Row */}
                    <div className="flex rounded-lg overflow-hidden border border-border/50 bg-secondary">
                      {resolutions.map((res) => (
                        <TooltipProvider key={res.value}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => setExportResolution(res.value as ExportResolution)}
                                disabled={isAnimating || isExporting}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm lg:text-base font-medium transition-all ${
                                  exportResolution === res.value
                                    ? "bg-primary/80 text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                              >
                                <span>{res.icon}</span>
                                <span>{res.label}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{res.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>

                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-muted-foreground">
                          {progress < 50 && "Capturing frames..."}
                          {progress >= 50 && progress < 85 && "Recording your magic..."}
                          {progress >= 85 && progress < 95 && "Encoding video..."}
                          {progress >= 95 && `Finalizing ${exportFormat.toUpperCase()}...`}
                        </span>
                        <span className="text-primary font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* Line limit warning */}
                  {isLineLimitExceeded && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                      <span className="text-red-400 text-sm lg:text-base font-medium">
                        ⚠️ Too long for video (Max {MAX_LINES} lines)
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handlePreview}
                      disabled={isAnimating || isExporting || isLineLimitExceeded}
                      variant="outline"
                      className="h-12 lg:h-14 border-border/50 text-sm lg:text-base"
                    >
                      <Play className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                      Preview
                    </Button>
                    
                    <Button 
                      onClick={handleExport}
                      disabled={isAnimating || isExporting || isLineLimitExceeded}
                      className="bg-gradient-to-r from-primary to-accent text-background font-semibold h-12 lg:h-14 text-sm lg:text-base btn-glow hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 spinner-smooth" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          {exportFormat === "gif" ? (
                            <ImageIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                          ) : (
                            <Film className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                          )}
                          Export {exportFormat.toUpperCase()}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right: Preview */}
              <div className="px-3 py-4 sm:p-8 lg:p-16 bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center min-h-[400px] sm:min-h-[500px] lg:min-h-[700px] relative overflow-hidden">
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
                  className="relative z-10 py-4 w-full max-w-full flex items-center justify-center"
                >
                  {isLineLimitExceeded ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-red-500/20 bg-red-500/5 min-w-[280px] min-h-[400px]">
                      <span className="text-5xl mb-4">🚫</span>
                      <h3 className="text-lg font-semibold text-red-400 mb-2">Limit Exceeded</h3>
                      <p className="text-sm text-muted-foreground max-w-[200px]">
                        Reduce your code to {MAX_LINES} lines or fewer to enable preview and export.
                      </p>
                      <p className="text-xs text-red-400/70 mt-4 font-mono">
                        {lineCount} / {MAX_LINES} lines
                      </p>
                    </div>
                  ) : aspectRatio === "portrait" ? (
                    <PhoneMockup>
                      <div ref={previewContainerRef} className="w-full h-full relative">
                        <CodePreview
                          ref={previewRef}
                          code={code}
                          theme={theme}
                          language={language}
                          aspectRatio="portrait"
                          typingDelay={typingDelay}
                          isAnimating={isAnimating}
                          showWatermark={!isPro && isExporting}
                          pausedLineIndices={pausedLineIndices}
                          pauseDuration={pauseDuration}
                        />
                      </div>
                    </PhoneMockup>
                  ) : (
                    <MacWindowMockup aspectRatio={aspectRatio}>
                      <div ref={previewContainerRef} className="w-full h-full relative">
                        <CodePreview
                          ref={previewRef}
                          code={code}
                          theme={theme}
                          language={language}
                          aspectRatio={aspectRatio}
                          typingDelay={typingDelay}
                          isAnimating={isAnimating}
                          showWatermark={!isPro && isExporting}
                          pausedLineIndices={pausedLineIndices}
                          pauseDuration={pauseDuration}
                        />
                      </div>
                    </MacWindowMockup>
                  )}
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
