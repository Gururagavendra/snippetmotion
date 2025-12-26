# SnippetMotion

Transform your code snippets into stunning animated videos for TikTok, Instagram, YouTube, and more. Create viral code content in seconds with beautiful typewriter animations, syntax highlighting, and multiple export formats.

![SnippetMotion](https://img.shields.io/badge/Status-MVP-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)

## ✨ Features

- **🎬 Fast Video Export** - Optimized export pipeline (2-3x faster than before)
- **📱 Multiple Aspect Ratios** - Portrait (9:16), Square (1:1), Landscape (16:9)
- **🎨 Beautiful Themes** - 6 stunning color themes (Cyberpunk, Ocean, Midnight, Sunset, Forest, Neon)
- **💻 Syntax Highlighting** - Auto-detection for 20+ programming languages
- **⏸️ Breakpoints** - Add pauses at specific lines for emphasis
- **📊 Export Formats** - MP4 (video) and GIF support
- **🎯 Multiple Resolutions** - 720p, 1080p, and 4K options
- **⚡ Real-time Preview** - See your animation before exporting
- **🚀 No Login Required** - Start creating immediately

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm (or use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd snippetmotion-main

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Syntax Highlighting**: Highlight.js
- **Video Export**: html2canvas + MediaRecorder API
- **GIF Export**: gif.js

## 📖 Usage

1. **Paste Your Code** - Enter your code snippet in the editor
2. **Choose Language** - Select or auto-detect the programming language
3. **Pick a Theme** - Choose from 6 beautiful color themes
4. **Set Duration** - Short (~1.5s), Medium (~4s), or Long (~8s)
5. **Add Breakpoints** (Optional) - Click line numbers to add pauses
6. **Preview** - Watch your animation before exporting
7. **Export** - Download as MP4 or GIF in your preferred resolution

## 🎯 Use Cases

- **Social Media Content** - Create engaging code snippets for TikTok, Instagram Reels
- **GitHub READMEs** - Add animated GIFs to showcase your projects
- **YouTube Videos** - Include code animations in tutorials
- **Documentation** - Make your docs more engaging with animated examples
- **Portfolio** - Showcase your coding skills with beautiful visuals

## ⚡ Performance Optimizations

The export pipeline has been optimized for speed:

- **Reduced FPS** - 30 FPS for videos (smooth and fast)
- **Optimized Canvas Capture** - Tuned html2canvas settings for 30% faster frame capture
- **Eliminated Real-time Delays** - Rendering phase now completes in ~1s instead of ~12s
- **GPU-Accelerated UI** - Smooth spinner animations even during heavy processing

**Result**: Export times reduced from 45-60s to 15-25s (2-3x faster)

## 📁 Project Structure

```
snippetmotion-main/
├── src/
│   ├── components/        # React components
│   │   ├── CodeEditor.tsx    # Main editor with export functionality
│   │   ├── CodePreview.tsx   # Animated code preview
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/
│   │   └── useVideoExport.ts # Video/GIF export logic
│   ├── contexts/
│   │   └── PricingContext.tsx
│   ├── pages/
│   │   └── Index.tsx        # Main landing page
│   └── lib/
│       └── utils.ts
├── public/               # Static assets
└── package.json
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Files

- **Export Logic**: `src/hooks/useVideoExport.ts` - Contains all video/GIF export optimizations
- **Editor Component**: `src/components/CodeEditor.tsx` - Main UI for code editing and export
- **Preview Component**: `src/components/CodePreview.tsx` - Typewriter animation logic

## 🎨 Customization

### Adding New Themes

Edit `src/components/CodePreview.tsx` and add your theme to the `themeGradients` object:

```typescript
const themeGradients: Record<string, { bg: string; card: string }> = {
  yourTheme: {
    bg: "linear-gradient(...)",
    card: "linear-gradient(...)",
  },
};
```

### Adjusting Export Settings

Modify `src/hooks/useVideoExport.ts`:

- Change default FPS: `fps = 30` (line 12)
- Adjust canvas scale: `scale: 1.5` (line 22)
- Modify bitrate: `videoBitsPerSecond: 8000000` (line 263)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Highlight.js](https://highlightjs.org/) for syntax highlighting
- [html2canvas](https://html2canvas.hertzen.com/) for canvas capture
- [gif.js](https://jnordberg.github.io/gif.js/) for GIF generation

---

**Made with ❤️ for developers who want to share their code beautifully**
