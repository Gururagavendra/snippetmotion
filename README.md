# SnippetMotion

> Transform your code snippets into stunning animated videos for TikTok, Instagram, YouTube, and more.

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

Create beautiful, shareable animated code videos in seconds. Perfect for social media, GitHub READMEs, tutorials, and more.

---

## Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Usage](#-usage)
- [Examples](#-examples)
- [Tech Stack](#-tech-stack)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🎬 **Fast Export** - Optimized pipeline exports videos 2-3x faster
- 📱 **Multiple Formats** - Portrait (9:16), Square (1:1), Landscape (16:9)
- 🎨 **Beautiful Themes** - 6 stunning color themes
- 💻 **Smart Highlighting** - Auto-detection for 20+ programming languages
- ⏸️ **Breakpoints** - Add pauses at specific lines for emphasis
- 📊 **Export Options** - MP4 video and GIF formats
- 🎯 **High Quality** - 720p, 1080p, and 4K resolution support
- ⚡ **Real-time Preview** - See your animation before exporting
- 🚀 **No Login** - Start creating immediately

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

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

Visit `http://localhost:5173` to start creating.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📖 Usage

1. **Paste your code** into the editor
2. **Select language** (or use auto-detection)
3. **Choose a theme** from 6 beautiful options
4. **Set duration** - Short (1.5s), Medium (4s), or Long (8s)
5. **Add breakpoints** (optional) - Click line numbers to pause
6. **Preview** your animation
7. **Export** as MP4 or GIF in your preferred resolution

## 🎯 Examples

### Social Media Content
Create engaging code snippets for TikTok, Instagram Reels, and YouTube Shorts.

### GitHub READMEs
Add animated GIFs to showcase your projects and make them stand out.

### Tutorials
Include code animations in YouTube videos and documentation.

### Portfolio
Showcase your coding skills with beautiful, professional visuals.

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Syntax Highlighting**: Highlight.js
- **Video Export**: html2canvas + MediaRecorder API
- **GIF Export**: gif.js

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Project Structure

```
snippetmotion-main/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks
│   ├── contexts/       # React contexts
│   ├── pages/          # Page components
│   └── lib/            # Utilities
├── public/             # Static assets
└── package.json
```

### Key Files

- `src/hooks/useVideoExport.ts` - Video/GIF export logic
- `src/components/CodeEditor.tsx` - Main editor component
- `src/components/CodePreview.tsx` - Animation preview

## 🎨 Customization

### Adding Themes

Edit `src/components/CodePreview.tsx`:

```typescript
const themeGradients: Record<string, { bg: string; card: string }> = {
  yourTheme: {
    bg: "linear-gradient(...)",
    card: "linear-gradient(...)",
  },
};
```

### Export Settings

Modify `src/hooks/useVideoExport.ts` to adjust FPS, scale, and bitrate.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is proprietary and private.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Highlight.js](https://highlightjs.org/) - Syntax highlighting
- [html2canvas](https://html2canvas.hertzen.com/) - Canvas capture
- [gif.js](https://jnordberg.github.io/gif.js/) - GIF generation

---

**Made with ❤️ for developers**
