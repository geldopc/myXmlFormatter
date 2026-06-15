# Plan 004: Add URL-Based Shareable State

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

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW — additive; no existing behavior changes unless a `?xml=` param is present
- **Depends on**: `plans/001-editor-ui-redesign.md` (must be DONE)
- **Category**: direction
- **Planned at**: no SHA (repo has no git), 2026-06-15

## Why this matters

Currently, refreshing the page loses all work. A shareable URL encodes the
formatted XML in the query string so users can bookmark or share a result.
The implementation uses the native browser `CompressionStream` API (no new npm
packages) to compress the XML before base64-encoding it, keeping URLs
manageable for typical XML sizes.

## Current state (after plan 001 is done)

### `src/pages/Home/index.tsx` — state initialization (target of this plan)

```tsx
const [input, setInput] = React.useState("");
const [viewMode, setViewMode] = React.useState<ViewMode>("edit");
```

### `src/routes/index.tsx` — router config

```tsx
const router = createBrowserRouter([
  { path: "/", element: <AppLayout />, children: [{ index: true, element: <Home /> }] },
]);
```

The router uses `createBrowserRouter` (HTML5 history API). Query params on
`/?xml=...` are accessible via `new URLSearchParams(window.location.search)`.
`react-router-dom`'s `useSearchParams` hook is also available but we will
use native `URLSearchParams` to avoid coupling the Home component to the router.

### `src/utils/` directory

After plan 001, this directory contains:
- `src/utils/xml.ts` — XML parsing utilities
- `src/utils/css.ts` — the `cn()` helper
- Optionally `src/utils/xmlHighlight.ts` (if plan 002 is done)

### Conventions

- New utility file follows the pattern of `src/utils/xml.ts`:
  named exports, TypeScript, no default export.
- No new npm packages — use only `CompressionStream` / `DecompressionStream`
  (available in all modern browsers: Chrome 80+, Firefox 113+, Safari 16.4+).
- URL parameter name: `xml` (i.e. `/?xml=<compressed-base64>`).

## Commands you will need

| Purpose    | Command                | Expected on success |
|------------|------------------------|---------------------|
| Typecheck  | `npx tsc --noEmit`     | exit 0, no output   |
| Dev server | `npm run dev`          | server starts       |

## Scope

**In scope**:
- `src/utils/encoding.ts` (create)
- `src/pages/Home/index.tsx` (modify initialization and add share button)

**Out of scope**:
- `src/routes/index.tsx` — do not touch the router config
- `src/index.css`, `src/components/` — no changes
- Server-side URL rewriting (not applicable — this is a SPA)

## Steps

### Step 1: Create `src/utils/encoding.ts`

This file exports two async functions for compressing/decompressing strings
using the browser's native `CompressionStream` API, and two thin wrappers
for URL encoding/decoding.

```typescript
async function compress(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const stream = new Response(encoder.encode(input))
    .body!
    .pipeThrough(new CompressionStream("gzip"));
  const compressed = await new Response(stream).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

async function decompress(encoded: string): Promise<string> {
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const stream = new Response(bytes)
    .body!
    .pipeThrough(new DecompressionStream("gzip"));
  const decompressed = await new Response(stream).arrayBuffer();
  return new TextDecoder().decode(decompressed);
}

export async function encodeForUrl(xml: string): Promise<string> {
  return encodeURIComponent(await compress(xml));
}

export async function decodeFromUrl(param: string): Promise<string> {
  return decompress(decodeURIComponent(param));
}
```

**Note on TypeScript**: `CompressionStream` and `DecompressionStream` are
available in `lib.dom.d.ts` from TypeScript 4.4+. The project uses TS 5.8,
so no additional `@types` are needed. If `tsc --noEmit` complains about these
types, add `"lib": ["ES2020", "DOM"]` to `tsconfig.app.json`'s
`compilerOptions` — but verify that no existing `lib` config is present first.

**Verify**: `npx tsc --noEmit` → exit 0.

### Step 2: Initialize `input` state from URL on mount

In `src/pages/Home/index.tsx`, replace the `input` state initialization
and add a `useEffect` to read from the URL on mount.

**Add import at the top**:
```tsx
import { decodeFromUrl, encodeForUrl } from "@utils/encoding";
```

**Replace the `input` state**:

Before:
```tsx
const [input, setInput] = React.useState("");
const [viewMode, setViewMode] = React.useState<ViewMode>("edit");
```

After:
```tsx
const [input, setInput] = React.useState("");
const [viewMode, setViewMode] = React.useState<ViewMode>("edit");
const [urlLoaded, setUrlLoaded] = React.useState(false);

React.useEffect(() => {
  const param = new URLSearchParams(window.location.search).get("xml");
  if (!param) {
    setUrlLoaded(true);
    return;
  }
  decodeFromUrl(param)
    .then((xml) => {
      setInput(xml);
      setViewMode("formatted");  // treat URL-loaded XML as already formatted
    })
    .catch(() => {
      // Invalid or corrupted URL param — silently ignore and start fresh
    })
    .finally(() => setUrlLoaded(true));
}, []); // runs once on mount
```

The `urlLoaded` flag prevents the editor from showing before the URL is read.
Add it to the JSX root: while `!urlLoaded`, render `null` (or a transparent
placeholder — keep it invisible to avoid flash):

```tsx
if (!urlLoaded) return null;
```

Place this return immediately before the main `return (...)` in the component.

**Verify**: `npx tsc --noEmit` → exit 0. Open the app normally (no param) —
confirm it loads identically to before. Open `/?xml=` with an invalid value —
confirm the app loads empty without crashing.

### Step 3: Add "Share" button to the floating toolbar in view mode

When the user is in view mode (`viewMode !== "edit"`), a "Share" button
should appear in the toolbar. Clicking it:
1. Compresses and encodes `input` into a URL param.
2. Replaces the browser history entry (`window.history.replaceState`) so the
   URL updates without navigation.
3. Copies the new full URL to the clipboard.
4. Shows temporary "Copied link!" feedback (reuse the `copied` state boolean
   but add a second boolean `sharedCopied` to avoid conflating with the "Copy
   XML" button).

**Add state**:
```tsx
const [sharedCopied, setSharedCopied] = React.useState(false);
```

**Add handler**:
```tsx
async function handleShare() {
  const encoded = await encodeForUrl(input);
  const url = `${window.location.origin}${window.location.pathname}?xml=${encoded}`;
  window.history.replaceState(null, "", url);
  await navigator.clipboard.writeText(url);
  setSharedCopied(true);
  setTimeout(() => setSharedCopied(false), 2000);
}
```

**Add to the toolbar** — inside the `viewMode !== "edit"` branch, after the
"Copy" button:

```tsx
<Button
  id="btn-share"
  size="sm"
  variant="ghost"
  onClick={handleShare}
  className="rounded-full h-8 px-4 text-xs"
>
  {sharedCopied ? (
    <><CheckIcon weight="bold" />Shared!</>
  ) : (
    <><LinkIcon weight="bold" />Share</>
  )}
</Button>
```

Use `LinkIcon` from `@phosphor-icons/react`.

Add the import:
```tsx
import { ..., LinkIcon } from "@phosphor-icons/react";
```

**Verify**: `npx tsc --noEmit` → exit 0. In the browser, format some XML,
click Share, confirm the URL updates in the address bar and the clipboard
contains the full URL. Open the URL in a new tab — confirm the XML is loaded
and displayed in view mode.

### Step 4: Clear URL param when user edits or clears

When the user returns to edit mode (via clicking the pre or pressing Escape),
or clears the editor, remove the `?xml=` param from the URL to avoid stale state.

Add a helper:
```tsx
function clearUrlParam() {
  if (window.location.search) {
    window.history.replaceState(null, "", window.location.pathname);
  }
}
```

Call it in two existing handlers:

In `handleBackToEdit`:
```tsx
function handleBackToEdit() {
  clearUrlParam();
  setViewMode("edit");
  requestAnimationFrame(() => textareaRef.current?.focus());
}
```

In `handleClear`:
```tsx
function handleClear() {
  clearUrlParam();
  setInput("");
  setError(null);
  setViewMode("edit");
}
```

**Verify**: Format XML → click Share → click Edit → confirm URL returns to
`/` with no query param. Format again → click Share → click Clear → confirm
URL returns to `/`.

## Test plan

Manual verification:

1. Run `npm run dev`, paste XML, click Prettify.
2. In view mode, click "Share" → confirm URL in address bar changes to
   `http://localhost:5299/?xml=<encoded>` and "Shared!" appears briefly.
3. Copy the URL. Open a new tab and paste it. Confirm:
   - The XML loads automatically.
   - View mode is active (highlighted pre visible, not textarea).
   - The "FORMATTED" badge is visible.
4. Click Edit → confirm URL clears to `http://localhost:5299/`.
5. Test with a large XML (~10 KB) — URL should still be copyable (gzip
   compression typically reduces XML by 70–80%, so 10 KB XML → ~3 KB → ~4 KB
   base64, a manageable URL length).
6. Manually corrupt the URL param (add random chars) → confirm the app loads
   empty without an error message or crash.
7. Open with no `?xml=` param → confirm app loads normally (no regression).

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `src/utils/encoding.ts` exists with `encodeForUrl` and `decodeFromUrl` exports
- [ ] Opening `/?xml=<valid-encoded-xml>` loads the XML in view mode
- [ ] "Share" button appears in the toolbar's view-mode branch
- [ ] Clicking Share updates the URL and copies it to the clipboard
- [ ] Clicking Edit or Clear removes the `?xml=` param from the URL
- [ ] Invalid URL param is silently ignored (no crash, app loads empty)
- [ ] Only `src/utils/encoding.ts` (new) and `src/pages/Home/index.tsx` are modified
- [ ] `package.json` is unchanged (no new dependencies)

## STOP conditions

- Plan 001 is not done (no `viewMode` state, no `handleBackToEdit`/`handleClear`).
- `CompressionStream` is not defined (check with `typeof CompressionStream` in
  the browser console — if `"undefined"`, the target browser is too old; stop
  and report).
- The compressed URL for a typical XML exceeds 2000 characters: consider that
  some URL shortening or server-side storage may be needed for large payloads —
  stop and report rather than shipping broken share links.
- `npx tsc --noEmit` reports errors in files outside scope.

## Maintenance notes

- The `?xml=` URL param is encoded with `encodeURIComponent` inside `encodeForUrl`,
  so special characters in the base64 output (`+`, `/`, `=`) are safely escaped.
- Plan 003 (drag-and-drop) also modifies `src/pages/Home/index.tsx`.
  Execute plans 003 and 004 separately; review both diffs before merging.
- If plan 003 is done first, `handleDrop` should also call `clearUrlParam()`
  after loading a file — add that call when integrating both plans.
- `window.history.replaceState` is used (not `pushState`) so that the back
  button after sharing does not navigate to a "previous share" URL.
- `CompressionStream` output format is gzip. If the encoding format needs to
  change in the future (e.g. to brotli), update both `compress` and `decompress`
  together — they are tightly coupled by the format string `"gzip"`.
