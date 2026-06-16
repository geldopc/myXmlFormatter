&lt;!-- LANGUAGE-SELECTOR:START -->
🌐 [English](README.md) · [Português](README.pt-BR.md)
&lt;!-- LANGUAGE-SELECTOR:END -->

<div align="center">

<img src="public/android-chrome-512x512.png" alt="myXmlFormatter logo" width="96" height="96" />

# myXmlFormatter

**A minimal, full-screen XML formatter built with React 19 and TypeScript.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-geldopc.github.io-black?style=flat-square)](https://geldopc.github.io/myXmlFormatter/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-black?style=flat-square)](LICENSE)

</div>

---

## What it is

Most XML formatters live in a sidebar. This one takes over the entire screen — edit, format, and inspect XML the way a developer actually works: full focus, no distractions.

Paste raw XML, press `⌘ Enter` to prettify or minify in-place, then share the result via a compressed URL — no server required.

**[→ Try it live](https://geldopc.github.io/myXmlFormatter/)**

---

## Features

| Feature | Details |
|---------|---------|
| **In-place formatting** | Prettify and minify replace the input directly — no split panels |
| **Dracula syntax highlighting** | Custom tokenizer colors tags, attributes, values, comments, PIs, CDATA, and DOCTYPE separately in both light and dark mode |
| **Shareable URLs** | XML is gzip-compressed with the native `CompressionStream` API and base64-encoded into the URL — zero dependencies |
| **Drag-and-drop** | Drop any `.xml` file to load it instantly |
| **Line numbers** | Synchronized gutter that tracks both the textarea and the read-only `<pre>` view |
| **XML sanitization** | Pre-pass strips malformed pseudo-comments (`<-- ... -->`) common in Brazilian NF-e documents before parsing |
| **Light & dark mode** | Theme toggle in the floating toolbar, persisted to `localStorage` |
| **Keyboard shortcuts** | `⌘ Enter` to format, `Esc` to return to edit mode |

---

## Tech decisions worth noting

**No syntax-highlighting library.** `src/utils/xmlHighlight.ts` is a hand-rolled left-to-right tokenizer (~120 lines) that handles comments, CDATA, DOCTYPE, processing instructions, and nested attributes. It keeps the bundle small and avoids a 200 KB dependency for a task this focused.

**No URL-state library.** Shareable URLs use the browser's native `CompressionStream("gzip")` and `btoa` — available in all modern browsers since Chrome 80, Firefox 113, and Safari 16.4. The compressed XML typically shrinks 70–80% before encoding.

**No backend.** Everything runs in the browser. Deployment is a static artifact via GitHub Actions → GitHub Pages.

**Atomic design with shadcn/ui.** Components follow the atoms → molecules → organisms hierarchy (`elements/`, `widgets/`, `modules/`). shadcn/ui primitives are used for the Button and Tooltip components; nothing more.

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | React 19 | Concurrent features + improved Server Components API |
| Language | TypeScript 5.8 | Strict mode throughout |
| Build | Vite 6 | Sub-second HMR, native ESM |
| Styling | Tailwind CSS v4 | CSS-first config, no PostCSS setup |
| Icons | Phosphor Icons | Consistent weight variants |
| Linting | Biome 2 | Single tool for lint + format |
| Deployment | GitHub Actions + Pages | Zero-config CI/CD |

---

## Getting started

```bash
git clone https://github.com/geldopc/myXmlFormatter.git
cd myXmlFormatter
npm install
npm run dev          # http://localhost:5299
```

**Other commands:**

```bash
npm run build        # TypeScript check + Vite build
npm run lint         # Biome lint
npm run format       # Biome format
```

---

## Project structure

```
src/
├── components/
│   ├── elements/    # atoms — Button, etc.
│   ├── widgets/     # molecules — ThemeToggle
│   └── modules/     # organisms — Navbar (unused after redesign)
├── pages/
│   └── Home/        # single-page app, all editor logic
├── providers/
│   └── Theme/       # light/dark theme context
├── utils/
│   ├── xml.ts           # formatXml, minifyXml, sanitizeXml
│   ├── xmlHighlight.ts  # custom XML tokenizer for syntax coloring
│   └── encoding.ts      # gzip + base64 for shareable URLs
└── routes/
    └── index.tsx    # react-router-dom v7 with GitHub Pages basename
```

---

## License

MIT — see [LICENSE](LICENSE).
