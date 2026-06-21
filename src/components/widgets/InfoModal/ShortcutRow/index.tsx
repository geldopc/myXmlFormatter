import * as React from "react";

interface ShortcutRowProps {
  keys: string[];
  label: string;
}

export function ShortcutRow({ keys, label }: ShortcutRowProps) {
  return (
    <div
      id={`shortcut-${label.replace(/\s+/g, "-").toLowerCase()}`}
      className="flex items-center justify-between gap-4"
    >
      <span className="font-mono text-xs text-foreground/60">{label}</span>
      <span className="flex shrink-0 items-center gap-0.5">
        {keys.map((k, i) => (
          <React.Fragment key={k}>
            {i > 0 && <span className="font-mono text-xs text-muted-foreground/40">+</span>}
            <kbd className="select-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {k}
            </kbd>
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}
