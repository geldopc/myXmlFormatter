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
import { highlightXml } from "@utils/xmlHighlight";

type ViewMode = "edit" | "formatted" | "minified";

export function Home() {
  const [input, setInput] = React.useState("");
  const [viewMode, setViewMode] = React.useState<ViewMode>("edit");
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const gutterRef = React.useRef<HTMLDivElement>(null);

  const lineCount = React.useMemo(
    () => Math.max(1, input.split("\n").length),
    [input]
  );

  const highlightedXml = React.useMemo(
    () => (viewMode !== "edit" ? highlightXml(input) : ""),
    [input, viewMode]
  );

  function process(fmt: "pretty" | "minify") {
    if (!input.trim()) return;
    const result = fmt === "pretty" ? formatXml(input) : minifyXml(input);
    if (result.error) {
      setError(result.error);
      setViewMode("edit");
    } else {
      setInput(result.value);
      setError(null);
      setViewMode(fmt === "pretty" ? "formatted" : "minified");
    }
  }

  function handleBackToEdit() {
    setViewMode("edit");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleClear() {
    setInput("");
    setError(null);
    setViewMode("edit");
  }

  async function handleCopy() {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function syncGutterScroll(scrollTop: number) {
    if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
      e.preventDefault();
      process("pretty");
    }
    if (e.key === "Escape" && viewMode !== "edit") {
      handleBackToEdit();
    }
  }

  return (
    <div id="home" className="flex flex-1 overflow-hidden">
      <div
        id="editor-area"
        className="flex flex-1 overflow-hidden font-mono text-sm leading-relaxed"
      >
        <div
          ref={gutterRef}
          id="line-gutter"
          aria-hidden="true"
          className="shrink-0 select-none text-right text-muted-foreground/25 overflow-hidden pt-8 pb-28 pr-3 pl-4 min-w-12"
        >
          {Array.from({ length: lineCount }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: line numbers are stable positional indices
            <div key={i + 1} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>

        <div className="w-px bg-border/25 shrink-0" />

        {viewMode === "edit" ? (
          <textarea
            ref={textareaRef}
            id="xml-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            onScroll={(e) => syncGutterScroll(e.currentTarget.scrollTop)}
            placeholder={"<root>\n  <paste>your XML here</paste>\n</root>"}
            spellCheck={false}
            wrap="off"
            className="flex-1 resize-none bg-transparent outline-none placeholder:text-muted-foreground/20 pt-8 pb-28 pl-4 pr-6 overflow-auto"
          />
        ) : (
          <pre
            id="xml-output"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: pre acts as a focusable read-only editor pane
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onClick={handleBackToEdit}
            onScroll={(e) => syncGutterScroll(e.currentTarget.scrollTop)}
            className="flex-1 overflow-auto pt-8 pb-28 pl-4 pr-6 cursor-text focus:outline-none whitespace-pre"
            dangerouslySetInnerHTML={{ __html: highlightedXml }}
          />
        )}
      </div>

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

      {error && (
        <div
          id="error-toast"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-start gap-2 rounded-xl border border-destructive/25 bg-background/90 backdrop-blur-xl px-4 py-3 text-destructive text-xs max-w-sm shadow-lg"
          style={{ animation: "slide-up 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <WarningCircleIcon weight="fill" className="mt-0.5 shrink-0" size={13} />
          <span className="font-mono break-all leading-relaxed">{error}</span>
        </div>
      )}

      <div
        id="floating-toolbar"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 rounded-full border border-border bg-background/80 backdrop-blur-xl px-1.5 py-1.5 shadow-2xl"
        style={{ animation: "slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <ThemeToggle />

        <div className="w-px h-4 bg-border/70 mx-1" />

        {viewMode === "edit" ? (
          <>
            <Button
              id="btn-pretty"
              size="sm"
              onClick={() => process("pretty")}
              disabled={!input.trim()}
              className="rounded-full h-8 px-4 text-xs"
            >
              <CodeIcon weight="bold" />
              Prettify
            </Button>
            <Button
              id="btn-minify"
              size="sm"
              variant="ghost"
              onClick={() => process("minify")}
              disabled={!input.trim()}
              className="rounded-full h-8 px-4 text-xs"
            >
              <MinusCircleIcon weight="bold" />
              Minify
            </Button>
            {input && (
              <>
                <div className="w-px h-4 bg-border/70 mx-1" />
                <Button
                  id="btn-clear"
                  size="sm"
                  variant="ghost"
                  onClick={handleClear}
                  className="rounded-full h-8 px-4 text-xs"
                >
                  <EraserIcon weight="bold" />
                  Clear
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Button
              id="btn-edit"
              size="sm"
              variant="ghost"
              onClick={handleBackToEdit}
              className="rounded-full h-8 px-4 text-xs"
            >
              <PencilSimpleIcon weight="bold" />
              Edit
            </Button>
            <Button
              id="btn-copy"
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="rounded-full h-8 px-4 text-xs"
            >
              {copied ? (
                <>
                  <CheckIcon weight="bold" />
                  Copied
                </>
              ) : (
                <>
                  <CopyIcon weight="bold" />
                  Copy
                </>
              )}
            </Button>
            <div className="w-px h-4 bg-border/70 mx-1" />
            <Button
              id="btn-clear"
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="rounded-full h-8 px-4 text-xs"
            >
              <EraserIcon weight="bold" />
              Clear
            </Button>
          </>
        )}

        <div className="w-px h-4 bg-border/70 mx-1" />
        <span className="font-mono text-xs text-muted-foreground/50 px-3 select-none tracking-wider">
          ⌘⇧F
        </span>
      </div>
    </div>
  );
}
