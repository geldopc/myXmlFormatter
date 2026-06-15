# Plan 003: Add Drag-and-Drop XML File Input

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
- **Effort**: S
- **Risk**: LOW — additive; does not touch the formatting logic
- **Depends on**: `plans/001-editor-ui-redesign.md` (must be DONE — this plan targets the `#editor-area` element introduced in plan 001)
- **Category**: direction
- **Planned at**: no SHA (repo has no git), 2026-06-15

## Why this matters

Users commonly have `.xml` files on disk that they want to format. Without
drag-and-drop, they must open the file, select all, copy, switch to the browser,
and paste. A drag-drop zone on the editor makes this a single gesture. The
feature is purely additive — it just pre-fills the textarea.

## Current state (after plan 001 is done)

### `src/pages/Home/index.tsx` — the `#editor-area` div

After plan 001, the editor area structure is:

```tsx
<div id="editor-area" className="flex flex-1 overflow-hidden font-mono text-sm leading-relaxed">
  {/* line gutter */}
  <div ref={gutterRef} id="line-gutter" ...>...</div>
  <div className="w-px bg-border/25 shrink-0" />
  {/* textarea (edit mode) or pre (view mode) */}
  {viewMode === "edit" ? <textarea ... /> : <pre ... />}
</div>
```

The state in the component includes:
```tsx
const [input, setInput] = React.useState("");
const [viewMode, setViewMode] = React.useState<ViewMode>("edit");
const [error, setError] = React.useState<string | null>(null);
```

### Conventions

- No new npm packages.
- No arbitrary Tailwind values.
- Use the File API (`FileReader`) — already available in all modern browsers.
- Visual drag feedback via a state boolean and conditional Tailwind classes.
- Phosphor icons: import with `Icon` suffix from `@phosphor-icons/react`.

## Commands you will need

| Purpose    | Command                | Expected on success |
|------------|------------------------|---------------------|
| Typecheck  | `npx tsc --noEmit`     | exit 0, no output   |
| Dev server | `npm run dev`          | server starts       |

## Scope

**In scope**:
- `src/pages/Home/index.tsx` (only)

**Out of scope**:
- Any other file.
- Adding file-type icons or a file-picker button (those are separate features).
- Server-side file processing.

## Steps

### Step 1: Add drag state

In `src/pages/Home/index.tsx`, add one new state variable after the existing state declarations:

```tsx
const [isDragging, setIsDragging] = React.useState(false);
```

### Step 2: Implement drag event handlers

Add the following four handlers inside the `Home` function,
after the existing handlers (`handleClear`, `handleCopy`, etc.):

```tsx
function handleDragOver(e: React.DragEvent) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  setIsDragging(true);
}

function handleDragLeave(e: React.DragEvent) {
  // Only clear when leaving the actual drop zone (not a child element)
  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
  setIsDragging(false);
}

function handleDragEnd() {
  setIsDragging(false);
}

function handleDrop(e: React.DragEvent) {
  e.preventDefault();
  setIsDragging(false);

  const file = e.dataTransfer.files[0];
  if (!file) return;

  // Accept any file — the XML parser in formatXml will validate
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target?.result;
    if (typeof text === "string") {
      setInput(text);
      setError(null);
      setViewMode("edit");
    }
  };
  reader.readAsText(file);
}
```

The `handleDragLeave` guard (`e.currentTarget.contains(...)`) prevents the
drag overlay from flickering when the cursor moves over child elements
(the gutter, the textarea, etc.) while still within the drop zone.

### Step 3: Attach handlers and visual feedback to `#home`

The drop zone is the entire `#home` div (the outermost element in Home's
return). Attach the handlers to it and add a conditional overlay when dragging.

**Before** (from plan 001):
```tsx
<div id="home" className="flex flex-1 overflow-hidden relative">
```

**After**:
```tsx
<div
  id="home"
  className="flex flex-1 overflow-hidden relative"
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDragEnd={handleDragEnd}
  onDrop={handleDrop}
>
```

### Step 4: Add drag-over overlay

Inside `#home`, as the first child (before `#editor-area`), add:

```tsx
{isDragging && (
  <div
    id="drag-overlay"
    aria-hidden="true"
    className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm border-2 border-dashed border-foreground/20 pointer-events-none"
    style={{ animation: "fade-in 0.15s ease forwards" }}
  >
    <UploadSimpleIcon weight="thin" size={48} className="opacity-40" />
    <span className="font-mono text-xs text-muted-foreground/60 tracking-widest uppercase select-none">
      Drop XML file to load
    </span>
  </div>
)}
```

Use `UploadSimpleIcon` from `@phosphor-icons/react`.
The overlay is `pointer-events-none` so it doesn't interfere with the drop event
landing on the parent.

Add the import:
```tsx
import { ..., UploadSimpleIcon } from "@phosphor-icons/react";
```

**Verify**: `npx tsc --noEmit` → exit 0.

## Test plan

Manual verification:

1. Run `npm run dev` and open the app.
2. Drag any `.xml` file from Finder/Explorer onto the editor area.
3. Confirm the translucent overlay with the upload icon and "Drop XML file to
   load" text appears while dragging over the window.
4. Release the file → confirm the overlay disappears and the textarea fills
   with the file's raw text content.
5. Confirm the `isDragging` overlay disappears when the cursor leaves the
   window (via `handleDragEnd` + `handleDragLeave`).
6. Drag a non-XML file (e.g. `.json`) → it loads; attempting to Prettify
   shows the error toast. This is correct — format validation happens in
   `formatXml`, not at the drop handler.
7. Drag and drop while in view mode → confirm `setViewMode("edit")` switches
   back to the textarea with the new file content.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] Dragging a file over the app shows the `#drag-overlay`
- [ ] Dropping an XML file fills the textarea with the file content
- [ ] Overlay disappears after drop or when cursor leaves the window
- [ ] Only `src/pages/Home/index.tsx` is modified
- [ ] No new npm packages added (`package.json` unchanged)

## STOP conditions

- Plan 001 is not yet done (no `#home` div or `viewMode` state).
- `FileReader` is unavailable (extremely unlikely in a modern browser; if
  `window.FileReader` is undefined, stop and report).
- `npx tsc --noEmit` reports errors in files outside scope.

## Maintenance notes

- `handleDragLeave` uses `e.currentTarget.contains(e.relatedTarget as Node)`.
  This is the standard cross-browser guard for nested drag-leave events.
  If drag flickering is reported on a specific browser, revisit this check.
- Plan 004 (URL shareable state) also modifies `src/pages/Home/index.tsx`.
  Execute plans 003 and 004 in separate passes; don't mix the changes.
- If a "click to open file" button is later added, it should call
  `<input type="file" accept=".xml,text/xml" />` programmatically and reuse
  the `reader.onload` logic from `handleDrop`.
