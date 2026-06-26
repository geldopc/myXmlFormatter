# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] — 2026-06-26

### Fixed
- Prettify now preserves `CDATA` sections — content of `<qrCode>` and `<urlChave>` (present in NF-e and NFC-e documents) was silently dropped after formatting

---

## [0.1.0] — 2026-06-26

### Added
- `__APP_VERSION__` injected from `package.json` at build time via Vite `define`
- **SuccessBurst** — particle animation on successful Prettify
- **ThemeOverlay** — sun/moon animation on theme toggle
- **BorderGlow** — magnetic gradient border on the floating toolbar (hover-activated)
- **SideToolbar** — fixed right-side pill with ThemeToggle, Info and Comic buttons
- **ComicViewer** — fullscreen modal with 174 developer comics from developerslife.tech; shuffle, keyboard navigation (Esc / →)
- **InfoModal** — app version, XML feature list, keyboard shortcuts reference
- SVG favicon (Nerdzilla brand mark)
- CodeMirror 6 editor with XML syntax highlighting, code folding, and Find & Replace panel
- URL sharing — XML embedded in URL via gzip + base64, shareable anywhere
- Drag-and-drop `.xml` file input
- Auto-sanitize pseudo-comments (`<-- -->`) from NF-e/NFC-e documents before parsing
- GoatCounter analytics

### Fixed
- CodeMirror XML highlight using correct `documentMeta` token
- ThemeToggle restored in floating toolbar after editor migration
- BorderGlow accepts optional `id` prop to avoid duplicate DOM ids
- `ShortcutRow` extracted to its own sub-component file
- rAF cancellation on unmount to prevent memory leaks in BorderGlow
- Info and Comic modals are mutually exclusive (opening one closes the other)
- ComicViewer stops retrying after 3 consecutive CDN errors
- Backdrop buttons removed from tab order (`tabIndex={-1}`)
