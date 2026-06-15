# Plan 001: Replace Split-Panel Layout with Full-Screen Single-Pane Editor

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: This repository has no git history. Before
> proceeding, manually compare the "Current state" excerpts below against
> the live files. If any excerpt doesn't match, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — rewrites the core UX of the only page
- **Depends on**: none
- **Category**: direction / tech-debt
- **Planned at**: no SHA (repo has no git), 2026-06-15

## Why this matters

The current design shows the formatted XML in a right panel beside the original
input. The desired UX is a modern text editor: the full screen is the editor,
formatting happens **in-place** (the input text is replaced by the formatted
result), and there is no persistent top navbar. Line numbers make it feel like
a real code editor. The navbar's only useful element (the theme toggle) moves
into the floating toolbar. Plans 002, 003, and 004 all build on this new layout.

## Current state

### `src/components/templates/AppLayout/index.tsx` (lines 1–17)

```tsx
import { Outlet } from "react-router-dom";
import { Navbar } from "@modules/Navbar";

type AppLayoutProps = { title?: string; };

export function AppLayout({ title }: AppLayoutProps) {
  return (
    <div id="app-layout" className="grain h-screen bg-background text-foreground flex flex-col">
      <Navbar title={title} />
      <main id="main-content" className="flex-1 pt-14 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
```

### `src/pages/Home/index.tsx` (key structure)

The component has two panels (`#input-panel` and `#output-panel` side by side),
plus `output` and `status` state separate from `input`. The floating toolbar
sits at `fixed bottom-6 left-1/2`. There is no `ThemeToggle` in the toolbar.

State shape today:
```tsx
const [input, setInput] = React.useState("");
const [output, setOutput] = React.useState("");
const [error, setError] = React.useState<string | null>(null);
const [status, setStatus] = React.useState<Status>("idle");
const [mode, setMode] = React.useState<Mode>("pretty");   // "pretty" | "minify"
const [copied, setCopied] = React.useState(false);
```

### Conventions to follow

- **Component naming**: named export `export function ComponentName()`, never `export default`.
- **No default exports** (CLAUDE.md rule).
- **Imports**: always use the `@/` alias (e.g. `@elements/Button`, `@widgets/ThemeToggle`).
- **Tailwind only, no arbitrary values** — no `w-[123px]` style brackets.
- **No inline comments** unless the logic is genuinely non-obvious.
- **Phosphor icons**: import with `Icon` suffix, from `@phosphor-icons/react`.
  Example from `src/components/widgets/ThemeToggle/index.tsx`:
  ```tsx
  import { MoonIcon, SunIcon } from "@phosphor-icons/react";
  ```
- **shadcn Button component** lives at `@elements/Button` and accepts `variant`
  (`default`, `outline`, `ghost`) and `size` (`sm`, `icon`). Always use it for buttons.

## Commands you will need

| Purpose    | Command                        | Expected on success         |
|------------|--------------------------------|-----------------------------|
| Typecheck  | `npx tsc --noEmit`             | exit 0, no output           |
| Lint       | `npx biome lint ./src`         | exit 0 (or only CSS warnings) |
| Dev server | `npm run dev`                  | server starts, open browser |

## Scope

**In scope** (the only files you should modify):
- `src/components/templates/AppLayout/index.tsx`
- `src/pages/Home/index.tsx`

**Out of scope** (do NOT touch):
- `src/components/modules/Navbar/index.tsx` — keep the file; just stop rendering it.
- `src/components/widgets/ThemeToggle/index.tsx` — used as-is, just moved to toolbar.
- `src/utils/xml.ts` — no logic changes in this plan.
- `src/index.css` — do not change existing color variables.
- `src/routes/index.tsx` — leave the router config as-is.

## Steps

### Step 1: Strip the navbar from AppLayout

In `src/components/templates/AppLayout/index.tsx`:

1. Remove the `import { Navbar }` line.
2. Remove `<Navbar title={title} />` from the JSX.
3. Remove `pt-14` from `<main>` (the navbar no longer occupies space).
4. Remove the `title` prop and its type (no longer needed).
5. Remove the `type AppLayoutProps` entirely.

The resulting file should be:

```tsx
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div id="app-layout" className="grain h-screen bg-background text-foreground flex flex-col">
      <main id="main-content" className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
```

**Verify**: `npx tsc --noEmit` → exit 0. If TypeScript complains about the
removed `title` prop, also update the call site in `src/routes/index.tsx`
by removing `title="MyXmlFormatter"` from `<AppLayout title="MyXmlFormatter" />`.

### Step 2: Rewrite Home — new state shape

Replace the entire content of `src/pages/Home/index.tsx`.

**New state shape** (replace the old `output`/`status` split):

```tsx
type ViewMode = "edit" | "formatted" | "minified";

const [input, setInput] = React.useState("");
const [viewMode, setViewMode] = React.useState<ViewMode>("edit");
const [error, setError] = React.useState<string | null>(null);
const [copied, setCopied] = React.useState(false);
```

**Two refs** (for scroll sync):
```tsx
const textareaRef = React.useRef<HTMLTextAreaElement>(null);
const gutterRef = React.useRef<HTMLDivElement>(null);
```

**Line count** (derived, memoised):
```tsx
const lineCount = React.useMemo(
  () => Math.max(1, input.split("\n").length),
  [input]
);
```

**New `process` function** — formats **in place** by calling `setInput(result.value)`:

```tsx
function process(fmt: "pretty" | "minify") {
  if (!input.trim()) return;
  const result = fmt === "pretty" ? formatXml(input) : minifyXml(input);
  if (result.error) {
    setError(result.error);
    setViewMode("edit");
  } else {
    setInput(result.value);           // ← replaces input with the formatted text
    setError(null);
    setViewMode(fmt === "pretty" ? "formatted" : "minified");
  }
}
```

**`handleBackToEdit`**:
```tsx
function handleBackToEdit() {
  setViewMode("edit");
  requestAnimationFrame(() => textareaRef.current?.focus());
}
```

**`handleClear`** — also resets `viewMode`:
```tsx
function handleClear() {
  setInput("");
  setError(null);
  setViewMode("edit");
}
```

**`handleCopy`** — copies `input` (which is the formatted text after processing):
```tsx
async function handleCopy() {
  if (!input) return;
  await navigator.clipboard.writeText(input);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}
```

**Scroll sync** — keeps gutter aligned with textarea scroll:
```tsx
function syncGutterScroll(scrollTop: number) {
  if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
}
```

**Keyboard handler** (attach to both textarea and pre):
```tsx
function handleKeyDown(e: React.KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
    e.preventDefault();
    process("pretty");
  }
  if (e.key === "Escape" && viewMode !== "edit") {
    handleBackToEdit();
  }
}
```

### Step 3: Rewrite Home — editor layout with line numbers

The JSX root is a single `<div id="home">` that fills the space. Inside it:
an `#editor-area` row (gutter + divider + content), plus the floating toolbar
and error toast.

**Structure**:
```
#home  (flex flex-1 overflow-hidden)
└── #editor-area  (flex flex-1 overflow-hidden font-mono text-sm leading-relaxed)
    ├── #line-gutter  (shrink-0, overflow-hidden, scroll synced)
    ├── .gutter-divider  (w-px bg-border/25)
    └── [textarea | pre]  (flex-1, overflow-auto)

#error-toast  (fixed, bottom-24 centered)
#floating-toolbar  (fixed, bottom-6 centered)
```

**Line gutter** element:
```tsx
<div
  ref={gutterRef}
  id="line-gutter"
  aria-hidden="true"
  className="shrink-0 select-none text-right text-muted-foreground/25 overflow-hidden pt-8 pb-28 pr-3 pl-4 min-w-12"
>
  {Array.from({ length: lineCount }, (_, i) => (
    <div key={i + 1} className="leading-relaxed">{i + 1}</div>
  ))}
</div>
```

**Edit mode** (when `viewMode === "edit"`): show the textarea.
```tsx
<textarea
  ref={textareaRef}
  id="xml-input"
  value={input}
  onChange={(e) => { setInput(e.target.value); setError(null); }}
  onKeyDown={handleKeyDown}
  onScroll={(e) => syncGutterScroll(e.currentTarget.scrollTop)}
  placeholder={"<root>\n  <paste>your XML here</paste>\n</root>"}
  spellCheck={false}
  wrap="off"
  className="flex-1 resize-none bg-transparent outline-none placeholder:text-muted-foreground/20 pt-8 pb-28 pl-4 pr-6 overflow-auto"
/>
```

**View mode** (when `viewMode !== "edit"`): show a read-only `<pre>`.
Clicking it or pressing Escape returns to edit mode.
Plan 002 will replace the text content with highlighted HTML;
for now just render the raw text.
```tsx
<pre
  id="xml-output"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleBackToEdit}
  onScroll={(e) => syncGutterScroll(e.currentTarget.scrollTop)}
  className="flex-1 overflow-auto pt-8 pb-28 pl-4 pr-6 cursor-text focus:outline-none text-foreground/85 whitespace-pre"
>
  {input}
</pre>
```

### Step 4: Rewrite Home — floating toolbar with ThemeToggle

Import `ThemeToggle` from `@widgets/ThemeToggle`. Add it as the first element
in the floating toolbar, separated from the action buttons by a divider.

The toolbar shows **different buttons depending on `viewMode`**:

- When `viewMode === "edit"`: ThemeToggle | divider | Prettify | Minify | [divider | Clear if input] | divider | ⌘⇧F hint
- When `viewMode !== "edit"`: ThemeToggle | divider | Edit | Copy | divider | Clear | divider | ⌘⇧F hint

```tsx
<div
  id="floating-toolbar"
  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 rounded-full border border-border bg-background/80 backdrop-blur-xl px-1.5 py-1.5 shadow-2xl"
  style={{ animation: "slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
>
  <ThemeToggle />

  <div className="w-px h-4 bg-border/70 mx-1" />

  {viewMode === "edit" ? (
    <>
      <Button id="btn-pretty" size="sm" onClick={() => process("pretty")} disabled={!input.trim()} className="rounded-full h-8 px-4 text-xs">
        <CodeIcon weight="bold" />
        Prettify
      </Button>
      <Button id="btn-minify" size="sm" variant="ghost" onClick={() => process("minify")} disabled={!input.trim()} className="rounded-full h-8 px-4 text-xs">
        <MinusCircleIcon weight="bold" />
        Minify
      </Button>
      {input && (
        <>
          <div className="w-px h-4 bg-border/70 mx-1" />
          <Button id="btn-clear" size="sm" variant="ghost" onClick={handleClear} className="rounded-full h-8 px-4 text-xs">
            <EraserIcon weight="bold" />
            Clear
          </Button>
        </>
      )}
    </>
  ) : (
    <>
      <Button id="btn-edit" size="sm" variant="ghost" onClick={handleBackToEdit} className="rounded-full h-8 px-4 text-xs">
        <PencilSimpleIcon weight="bold" />
        Edit
      </Button>
      <Button id="btn-copy" size="sm" variant="ghost" onClick={handleCopy} className="rounded-full h-8 px-4 text-xs">
        {copied ? <><CheckIcon weight="bold" />Copied</> : <><CopyIcon weight="bold" />Copy</>}
      </Button>
      <div className="w-px h-4 bg-border/70 mx-1" />
      <Button id="btn-clear" size="sm" variant="ghost" onClick={handleClear} className="rounded-full h-8 px-4 text-xs">
        <EraserIcon weight="bold" />
        Clear
      </Button>
    </>
  )}

  <div className="w-px h-4 bg-border/70 mx-1" />
  <span className="font-mono text-xs text-muted-foreground/50 px-3 select-none tracking-wider">⌘⇧F</span>
</div>
```

Use `PencilSimpleIcon` from `@phosphor-icons/react` for the Edit button.

### Step 5: Add status badge for view mode

When `viewMode !== "edit"`, show a small floating badge at top-right indicating
"FORMATTED" or "MINIFIED" with a green dot. This replaces the panel label from
the old design.

```tsx
{viewMode !== "edit" && (
  <div
    id="status-badge"
    className="fixed top-4 right-6 z-50 flex items-center gap-1.5 select-none pointer-events-none"
    style={{ animation: "fade-in 0.2s ease forwards" }}
  >
    <div className="w-1.5 h-1.5 rounded-full bg-green-500/70" />
    <span className="font-mono text-xs text-muted-foreground/40 tracking-widest uppercase">
      {viewMode}
    </span>
  </div>
)}
```

### Step 6: Final imports cleanup

The new `Home` imports needed:
```tsx
import * as React from "react";
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EraserIcon,
  MinusCircleIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@elements/Button";
import { ThemeToggle } from "@widgets/ThemeToggle";
import { formatXml, minifyXml } from "@utils/xml";
```

Remove the `cn` import — it is no longer needed.
Remove the `Status` and old `Mode` types; add `ViewMode` as defined in Step 2.

**Verify**:
1. `npx tsc --noEmit` → exit 0
2. `npx biome lint ./src` → no new errors beyond pre-existing CSS warnings

## Test plan

There are currently no tests in this repo. Manual verification:

1. Run `npm run dev` and open the app in a browser.
2. Confirm no navbar or header is visible.
3. Confirm line numbers appear on the left, counting from 1.
4. Paste multi-line XML into the editor; confirm line count updates.
5. Click "Prettify" → confirm the textarea disappears, a formatted `<pre>` appears with the same line numbers, and the "FORMATTED" badge appears top-right.
6. Click anywhere in the `<pre>` → confirm the textarea reappears with the formatted text; line numbers still match.
7. Press Escape while in view mode → confirm return to edit mode.
8. Press ⌘⇧F (or Ctrl+Shift+F on Windows) → confirm Prettify fires.
9. Click "Minify" → confirm `<pre>` shows single-line XML and badge says "MINIFIED".
10. Click "Edit" button in toolbar → confirm return to edit mode.
11. Click "Copy" in view mode → confirm clipboard has the formatted text.
12. Click "Clear" → confirm textarea is empty, viewMode resets to "edit".
13. Confirm ThemeToggle in toolbar still switches light/dark.
14. Paste invalid XML → confirm error toast appears above the toolbar.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] No navbar visible in browser at any viewport width
- [ ] Line numbers visible and synchronized with textarea scroll
- [ ] Formatting replaces textarea content (no side panel)
- [ ] `<pre>` view is read-only; click or Escape returns to edit mode
- [ ] ThemeToggle is in the floating toolbar, not at the top of the screen
- [ ] Only `src/components/templates/AppLayout/index.tsx` and `src/pages/Home/index.tsx` are modified

## STOP conditions

- The code at any "Current state" location doesn't match the excerpt above.
- `npx tsc --noEmit` emits errors that aren't from the files in scope.
- The `ThemeToggle` component requires props or context that is currently
  provided by `AppLayout`/`Navbar` — check `src/providers/Theme/index.tsx`
  to confirm `ThemeProvider` is still wrapping the app in `src/main.tsx`.
- A step's verify command fails twice after a reasonable fix attempt.

## Maintenance notes

- Plan 002 adds syntax highlighting to the `<pre>` in view mode. It will replace
  `{input}` (the raw text child) with `dangerouslySetInnerHTML`. Design the pre
  element so that change is additive.
- Plan 003 adds drag-drop to the editor area. The `#editor-area` div will get
  drag event handlers; don't add any drag prevention (`e.preventDefault` on
  default drop) to the outer `#home` div.
- Plan 004 reads URL params on mount and sets `input` state. The `useState("")`
  initializer will become `useState(readFromUrl())` — no other state changes.
- The `AppLayout` no longer accepts a `title` prop; update `src/routes/index.tsx`
  if it still passes one.
