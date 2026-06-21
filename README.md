<!-- LANGUAGE-SELECTOR:START -->
🌐 [English](README.md) · [Português](README.pt-BR.md)
<!-- LANGUAGE-SELECTOR:END -->

<div align="center">

<img src="public/android-chrome-512x512.png" alt="myXmlFormatter logo" width="96" height="96" />

# myXmlFormatter

**A minimal, full-screen XML formatter — prettify, minify, find/replace and share, right in your browser. No server, no sign-up, no clutter.**

[![Live demo](https://img.shields.io/badge/live%20demo-online-22c55e?style=flat-square)](https://geldopc.github.io/myXmlFormatter/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-black?style=flat-square)](#license)

### [→ Open the live app](https://geldopc.github.io/myXmlFormatter/)

</div>

---

## Why

Most online XML tools are buried in ads, ship your data to a server, or make you scroll past a wall of options. **myXmlFormatter** is the opposite: one full-screen editor, the few actions you actually use, and everything happens locally in your browser. Paste, prettify, share the link — done.

## Features

- ⚡ **Prettify & minify** in one click or one keystroke — with auto-sanitization of pseudo-comments like `<-- ... -->` common in Brazilian NF-e documents.
- 🎨 **Live syntax highlighting** powered by CodeMirror 6 — tags, attributes, values, comments, processing instructions, CDATA, and DOCTYPE each get their own color.
- 📂 **Fold/Unfold** — collapse any XML block to focus on what matters; fold gutter in the left margin.
- 🔍 **Find & Replace** with **match case**, **whole word**, and **regex** — every match highlighted, with a live `current/total` counter.
- 🔗 **Share via URL** — the XML is gzip-compressed and encoded into the link itself, so there is no server and nothing is stored.
- 📋 **Copy** to clipboard and 📂 **drag & drop** a `.xml` file to load it instantly.
- ⌨️ **Keyboard-first** — prettify, find, fold, and undo without leaving the keyboard.
- 🙂 **Comic break** — a random developer comic from [developerslife.tech](https://developerslife.tech/en/) for when you need a laugh.
- 🪶 **100% client-side** — no backend, no tracking of your XML; deployed for free on GitHub Pages.

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| Prettify | `Ctrl`/`⌘` + `Enter` |
| Find & Replace | `Ctrl`/`⌘` + `F` |
| Fold block | `Ctrl`/`⌘` + `Alt`/`⌥` + `[` |
| Unfold block | `Ctrl`/`⌘` + `Alt`/`⌥` + `]` |
| Next / previous match (in Find) | `Enter` / `Shift` + `Enter` |
| Close panel | `Esc` |

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript 5.8 |
| Build | Vite 6 |
| Editor | CodeMirror 6 + `@uiw/react-codemirror` |
| Styling | Tailwind CSS v4 |
| Icons | Phosphor Icons |
| Linting | Biome 2 |
| Deployment | GitHub Actions + Pages |

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

## License

MIT — see [LICENSE](LICENSE).
