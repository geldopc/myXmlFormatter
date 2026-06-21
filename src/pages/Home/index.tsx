import { foldAll, unfoldAll } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { Button } from "@elements/Button";
import { Tooltip } from "@elements/Tooltip";
import { XmlEditor } from "@modules/XmlEditor";
import {
  ArrowsInSimpleIcon,
  ArrowsOutSimpleIcon,
  CodeIcon,
  CopyIcon,
  EraserIcon,
  LinkIcon,
  MinusCircleIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { decodeFromUrl, encodeForUrl } from "@utils/encoding";
import { isMac } from "@utils/platform";
import { formatXml, minifyXml, sanitizeXml } from "@utils/xml";
import { BorderGlow } from "@widgets/BorderGlow";
import { FindReplace } from "@widgets/FindReplace";
import { SideToolbar } from "@modules/SideToolbar";
import * as React from "react";
import { toast } from "sonner";
import { useTheme } from "@hooks/Theme";

const SuccessBurst = React.lazy(() =>
  import("@widgets/SuccessBurst").then((m) => ({ default: m.SuccessBurst }))
);
const ThemeOverlay = React.lazy(() =>
  import("@widgets/ThemeOverlay").then((m) => ({ default: m.ThemeOverlay }))
);

export function Home() {
  const [input, setInput] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const [urlLoaded, setUrlLoaded] = React.useState(false);
  const [isFindOpen, setIsFindOpen] = React.useState(false);
  const [isComicOpen, setIsComicOpen] = React.useState(false);
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);

  const [burst, setBurst] = React.useState(0);
  const [themeAnim, setThemeAnim] = React.useState<{ key: number; variant: "sun" | "moon" }>({
    key: 0,
    variant: "sun",
  });

  const { theme } = useTheme();
  const isDark =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : theme === "dark";
  const prevThemeRef = React.useRef(theme);

  const viewRef = React.useRef<EditorView | null>(null);
  const inputRef = React.useRef(input);
  inputRef.current = input;

  React.useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("xml");
    if (!param) {
      setUrlLoaded(true);
      return;
    }
    decodeFromUrl(param)
      .then((xml) => setInput(xml))
      .catch(() => {})
      .finally(() => setUrlLoaded(true));
  }, []);

  React.useEffect(() => {
    if (prevThemeRef.current === theme) return;
    const goingDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setThemeAnim((prev) => ({ key: prev.key + 1, variant: goingDark ? "moon" : "sun" }));
    prevThemeRef.current = theme;
  }, [theme]);

  function process(fmt: "pretty" | "minify") {
    const current = inputRef.current;
    if (!current.trim()) return;
    const { value: sanitized, removedCount } = sanitizeXml(current);
    const result = fmt === "pretty" ? formatXml(sanitized) : minifyXml(sanitized);
    if (result.error) {
      toast.error("That doesn't look like XML", { description: result.error });
      return;
    }
    setInput(result.value);
    setBurst((b) => b + 1);
    requestAnimationFrame(() => {
      viewRef.current?.dispatch({
        selection: { anchor: 0 },
        effects: EditorView.scrollIntoView(0, { y: "start" }),
      });
    });
    const fixNote =
      removedCount > 0
        ? `Tidied up ${removedCount} thing${removedCount === 1 ? "" : "s"} along the way.`
        : undefined;
    toast.success(fmt === "pretty" ? "Prettified" : "Minified", {
      description: fixNote ?? (fmt === "pretty" ? "Looking sharp." : "Every byte counts."),
    });
  }

  function clearUrlParam() {
    if (window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  function handleClear() {
    clearUrlParam();
    setInput("");
    toast("Cleared", { description: "Fresh start." });
  }

  async function handleShare() {
    const encoded = await encodeForUrl(input);
    const url = `${window.location.origin}${window.location.pathname}?xml=${encoded}`;
    window.history.replaceState(null, "", url);
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied", {
      description: "Paste it anywhere — the XML travels with it.",
    });
  }

  async function handleCopy() {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    toast.success("Copied", { description: "The XML is on your clipboard." });
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
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
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setInput(text);
        toast.success("File loaded", { description: file.name });
      }
    };
    reader.readAsText(file);
  }

  function handleFoldAll() {
    if (!viewRef.current) return;
    foldAll(viewRef.current);
  }

  function handleUnfoldAll() {
    if (!viewRef.current) return;
    unfoldAll(viewRef.current);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: process reads input via inputRef; only isFindOpen affects the handler
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        process("pretty");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setIsFindOpen((v) => !v);
      }
      if (e.key === "Escape" && isFindOpen) {
        setIsFindOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFindOpen]);

  if (!urlLoaded) return null;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop container needs native drag events
    <div
      id="home"
      className="relative flex flex-1 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDragEnd={handleDragEnd}
      onDrop={handleDrop}
    >
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

      <div
        id="editor-area"
        className="relative flex flex-1 overflow-hidden font-mono text-sm leading-relaxed"
      >
        <XmlEditor
          value={input}
          onChange={setInput}
          onCreateEditor={(view) => {
            viewRef.current = view;
          }}
        />
        {isFindOpen && <FindReplace view={viewRef.current} onClose={() => setIsFindOpen(false)} />}
        <React.Suspense fallback={null}>
          <SuccessBurst triggerKey={burst} onDone={() => setBurst(0)} />
        </React.Suspense>
      </div>

      <div
        id="floating-toolbar-pos"
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        style={{ animation: "slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <BorderGlow
          borderRadius={9999}
          backgroundColor="color-mix(in oklch, var(--background) 85%, transparent)"
          glowColor={isDark ? "0 0 90" : "38 65 28"}
          glowRadius={10}
          glowIntensity={0.5}
          coneSpread={10}
          edgeSensitivity={10}
          colors={isDark ? ["#D4A853", "#B8B8C0", "#B07D5A"] : ["#1a1a1a", "#8B6914", "#7A4522"]}
          borderColor={isDark ? undefined : "rgb(0 0 0 / 12%)"}
          fillOpacity={0.08}
          className="backdrop-blur-xl"
          animated
        >
        <div
          id="floating-toolbar"
          className="flex items-center gap-0.5 px-1.5 py-1.5"
        >
          <Button
            id="btn-pretty"
            size="sm"
            onClick={() => process("pretty")}
            disabled={!input.trim()}
            className="rounded-full h-8 px-2 sm:pl-4 sm:pr-2 text-xs"
          >
            <CodeIcon weight="bold" />
            <span className="hidden sm:inline">Prettify</span>
            <span id="kbd-pretty" className="hidden sm:inline-flex items-center gap-0.5 ml-1">
              {isMac() ? (
                <>
                  <kbd className="rounded border border-primary-foreground/25 bg-primary-foreground/10 px-1 py-0.5 font-mono text-xs text-primary-foreground/70 select-none">
                    ⌘
                  </kbd>
                  <span className="font-mono text-xs text-primary-foreground/40">+</span>
                  <kbd className="rounded border border-primary-foreground/25 bg-primary-foreground/10 px-1 py-0.5 font-mono text-xs text-primary-foreground/70 select-none">
                    ↵
                  </kbd>
                </>
              ) : (
                <>
                  <kbd className="rounded border border-primary-foreground/25 bg-primary-foreground/10 px-1 py-0.5 font-mono text-xs text-primary-foreground/70 select-none">
                    Ctrl
                  </kbd>
                  <span className="font-mono text-xs text-primary-foreground/40">+</span>
                  <kbd className="rounded border border-primary-foreground/25 bg-primary-foreground/10 px-1 py-0.5 font-mono text-xs text-primary-foreground/70 select-none">
                    ↵
                  </kbd>
                </>
              )}
            </span>
          </Button>

          <Tooltip label="bye, whitespace">
            <Button
              id="btn-minify"
              size="icon"
              variant="ghost"
              onClick={() => process("minify")}
              disabled={!input.trim()}
              className="rounded-full"
            >
              <MinusCircleIcon weight="bold" />
            </Button>
          </Tooltip>

          <div className="mx-1 h-4 w-px bg-border/70" />

          <Tooltip label="fold all">
            <Button
              id="btn-fold-all"
              size="icon"
              variant="ghost"
              onClick={handleFoldAll}
              disabled={!input.trim()}
              className="rounded-full"
            >
              <ArrowsInSimpleIcon weight="bold" />
            </Button>
          </Tooltip>

          <Tooltip label="unfold all">
            <Button
              id="btn-unfold-all"
              size="icon"
              variant="ghost"
              onClick={handleUnfoldAll}
              disabled={!input.trim()}
              className="rounded-full"
            >
              <ArrowsOutSimpleIcon weight="bold" />
            </Button>
          </Tooltip>

          {input && (
            <>
              <div className="mx-1 h-4 w-px bg-border/70" />
              <Tooltip label="yoink">
                <Button
                  id="btn-copy"
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  className="rounded-full"
                >
                  <CopyIcon weight="bold" />
                </Button>
              </Tooltip>
              <Tooltip label="spread the XML">
                <Button
                  id="btn-share"
                  size="icon"
                  variant="ghost"
                  onClick={handleShare}
                  className="rounded-full"
                >
                  <LinkIcon weight="bold" />
                </Button>
              </Tooltip>
              <Tooltip label="burn it all">
                <Button
                  id="btn-clear"
                  size="icon"
                  variant="ghost"
                  onClick={handleClear}
                  className="rounded-full"
                >
                  <EraserIcon weight="bold" />
                </Button>
              </Tooltip>
            </>
          )}

          <div className="mx-1 hidden h-4 w-px bg-border/70 sm:block" />
          <span id="kbd-find-hint" className="hidden sm:inline-flex items-center gap-0.5 px-2">
            {isMac() ? (
              <>
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs text-muted-foreground select-none">
                  ⌘
                </kbd>
                <span className="font-mono text-xs text-muted-foreground/40">+</span>
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs text-muted-foreground select-none">
                  F
                </kbd>
              </>
            ) : (
              <>
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs text-muted-foreground select-none">
                  Ctrl
                </kbd>
                <span className="font-mono text-xs text-muted-foreground/40">+</span>
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-xs text-muted-foreground select-none">
                  F
                </kbd>
              </>
            )}
          </span>
        </div>
        </BorderGlow>
      </div>
      <SideToolbar
        onInfoOpen={() => setIsInfoOpen(true)}
        onComicOpen={() => setIsComicOpen(true)}
      />
      <React.Suspense fallback={null}>
        <ThemeOverlay
          triggerKey={themeAnim.key}
          variant={themeAnim.variant}
          onDone={() => setThemeAnim({ key: 0, variant: "sun" })}
        />
      </React.Suspense>
    </div>
  );
}
