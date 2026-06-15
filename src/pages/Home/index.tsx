import * as React from "react";
import {
  CheckIcon,
  CodeIcon,
  CopyIcon,
  EraserIcon,
  MinusCircleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { Button } from "@elements/Button";
import { formatXml, minifyXml } from "@utils/xml";
import { cn } from "@utils/css";

type Status = "idle" | "success" | "error";
type Mode = "pretty" | "minify";

export function Home() {
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [mode, setMode] = React.useState<Mode>("pretty");
  const [copied, setCopied] = React.useState(false);

  function process(currentMode: Mode) {
    if (!input.trim()) return;
    const result = currentMode === "pretty" ? formatXml(input) : minifyXml(input);
    if (result.error) {
      setError(result.error);
      setOutput("");
      setStatus("error");
    } else {
      setOutput(result.value);
      setError(null);
      setStatus("success");
      setMode(currentMode);
    }
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setError(null);
    setStatus("idle");
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
      e.preventDefault();
      process("pretty");
    }
  }

  const hasOutput = output.length > 0;
  const hasContent = !!(input || output);

  return (
    <div id="home" className="flex flex-1 overflow-hidden relative">
      {/* Input panel */}
      <div
        id="input-panel"
        className={cn(
          "flex flex-col relative transition-all duration-500 ease-in-out",
          hasOutput ? "w-1/2 border-r border-border/50" : "w-full"
        )}
      >
        <span className="absolute top-5 left-6 z-10 font-mono text-xs text-muted-foreground/40 tracking-widest uppercase select-none pointer-events-none">
          input
        </span>
        <textarea
          id="xml-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setStatus("idle");
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={"<root>\n  <paste>your XML here</paste>\n</root>"}
          spellCheck={false}
          wrap="off"
          className="flex-1 w-full resize-none bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/20 px-6 pt-12 pb-28 leading-relaxed caret-foreground selection:bg-foreground/15 overflow-x-auto"
        />
      </div>

      {/* Output panel */}
      {hasOutput && (
        <div
          id="output-panel"
          className="flex-1 flex flex-col overflow-hidden relative"
          style={{ animation: "fade-in 0.25s ease forwards" }}
        >
          <div className="absolute top-5 left-6 z-10 flex items-center gap-2 pointer-events-none select-none">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/70" />
            <span className="font-mono text-xs text-muted-foreground/40 tracking-widest uppercase">
              {mode === "pretty" ? "formatted" : "minified"}
            </span>
          </div>
          <pre
            id="xml-output"
            className="flex-1 overflow-auto font-mono text-sm px-6 pt-12 pb-28 leading-relaxed text-foreground/80 whitespace-pre"
          >
            {output}
          </pre>
        </div>
      )}

      {/* Error toast */}
      {status === "error" && error && (
        <div
          id="error-toast"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-start gap-2 rounded-xl border border-destructive/25 bg-background/90 backdrop-blur-xl px-4 py-3 text-destructive text-xs max-w-sm shadow-lg"
          style={{ animation: "slide-up 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <WarningCircleIcon weight="fill" className="mt-0.5 shrink-0" size={13} />
          <span className="font-mono break-all leading-relaxed">{error}</span>
        </div>
      )}

      {/* Floating toolbar */}
      <div
        id="floating-toolbar"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 rounded-full border border-border bg-background/80 backdrop-blur-xl px-1.5 py-1.5 shadow-2xl"
        style={{ animation: "slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
      >
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

        {hasContent && (
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

        {hasOutput && (
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
        )}

        <div className="w-px h-4 bg-border/70 mx-1" />
        <span className="font-mono text-xs text-muted-foreground/50 px-3 select-none tracking-wider">
          ⌘⇧F
        </span>
      </div>
    </div>
  );
}
