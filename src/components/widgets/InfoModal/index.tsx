import { Button } from "@elements/Button";
import { useFocusTrap } from "@hooks/FocusTrap";
import { ShortcutRow } from "@widgets/InfoModal/ShortcutRow";
import { XIcon } from "@phosphor-icons/react";
import { isMac } from "@utils/platform";
import * as React from "react";

interface InfoModalProps {
  onClose: () => void;
}

export function InfoModal({ onClose }: InfoModalProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, true);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const mod = isMac() ? "⌘" : "Ctrl";
  const foldMod = isMac() ? "⌥" : "⇧";

  return (
    <div
      id="info-modal-overlay"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="About XML Formatter"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ zIndex: 60 }}
    >
      <button
        id="info-modal-backdrop"
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-background/85 backdrop-blur-sm"
      />

      <div
        id="info-modal-card"
        className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-2xl animate-slide-up"
      >
        <Button
          id="info-modal-close"
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full"
        >
          <XIcon weight="bold" />
        </Button>

        <div className="mb-4">
          <h2
            id="info-modal-title"
            className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground"
          >
            My XML Formatter
          </h2>
          <span className="font-mono text-xs text-muted-foreground/40">v{__APP_VERSION__}</span>
        </div>

        <section id="info-features" className="mb-5">
          <ul className="space-y-2 font-mono text-xs text-foreground/70">
            <li>Prettify — your XML deserves to breathe</li>
            <li>Minify — strips whitespace, aggressively</li>
            <li>Auto-sanitize — removes pseudo-comments like &lt;-- --&gt; from NF-e docs</li>
            <li>Syntax highlight — tags, attrs, values, comments, PIs, CDATA in color</li>
            <li>Fold / Unfold — collapse XML blocks to focus on what matters</li>
            <li>Share — embeds your XML in the URL, travels anywhere</li>
            <li>Find &amp; Replace — regex, case, whole-word, the works</li>
            <li>Drag &amp; Drop — drop a .xml file to load it instantly</li>
          </ul>
        </section>

        <section id="info-shortcuts">
          <h3 className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground/50">
            Shortcuts
          </h3>
          <div className="space-y-1.5">
            <ShortcutRow keys={[mod, "↵"]} label="Prettify" />
            <ShortcutRow keys={[mod, "F"]} label="Find & Replace" />
            <ShortcutRow keys={["↵"]} label="Next match (in find panel)" />
            <ShortcutRow keys={["⇧", "↵"]} label="Previous match" />
            <ShortcutRow keys={["Esc"]} label="Close find panel" />
            <ShortcutRow keys={[mod, foldMod, "["]} label="Fold block" />
            <ShortcutRow keys={[mod, foldMod, "]"]} label="Unfold block" />
          </div>
        </section>
      </div>
    </div>
  );
}
