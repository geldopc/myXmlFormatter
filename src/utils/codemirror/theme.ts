import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

const baseTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "transparent",
    color: "var(--foreground)",
    fontSize: "0.875rem",
  },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    lineHeight: "1.625",
    overflow: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "color-mix(in oklab, var(--foreground) 22%, transparent) transparent",
  },
  ".cm-scroller::-webkit-scrollbar": { width: "10px", height: "10px" },
  ".cm-scroller::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  ".cm-scroller::-webkit-scrollbar-thumb": {
    backgroundColor: "color-mix(in oklab, var(--foreground) 22%, transparent)",
    borderRadius: "9999px",
    border: "2px solid transparent",
    backgroundClip: "content-box",
  },
  ".cm-scroller::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "color-mix(in oklab, var(--foreground) 38%, transparent)",
  },
  ".cm-scroller::-webkit-scrollbar-corner": { backgroundColor: "transparent" },
  ".cm-placeholder": {
    color: "color-mix(in oklab, var(--muted-foreground) 60%, transparent)",
    whiteSpace: "pre",
    lineHeight: "1.625",
  },
  ".cm-content": {
    padding: "0 1.5rem 7rem 1rem",
    caretColor: "var(--foreground)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-gutters": {
    backgroundColor: "var(--background)",
    border: "none",
    color: "color-mix(in oklab, var(--muted-foreground) 40%, transparent)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 0.75rem 0 1rem" },
  ".cm-activeLine": { backgroundColor: "transparent" },
  ".cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklab, var(--foreground) 7%, transparent)",
    color: "var(--foreground)",
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--foreground)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "color-mix(in oklab, var(--foreground) 15%, transparent)",
  },
  ".cm-searchMatch": {
    backgroundColor: "color-mix(in oklab, var(--foreground) 12%, transparent)",
    borderRadius: "2px",
  },
  ".cm-searchMatch-selected": {
    backgroundColor: "color-mix(in oklab, var(--foreground) 30%, transparent)",
  },
  ".cm-panels": { display: "none" },
  ".cm-foldGutter .cm-gutterElement": {
    padding: "0 0.25rem",
    cursor: "pointer",
    color: "color-mix(in oklab, var(--muted-foreground) 40%, transparent)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  ".cm-foldGutter .cm-gutterElement:hover": {
    color: "var(--foreground)",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "transparent",
    border: "none",
    color: "color-mix(in oklab, var(--muted-foreground) 40%, transparent)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    cursor: "pointer",
    padding: "0 0.25rem",
  },
  ".cm-foldPlaceholder:hover": {
    color: "var(--foreground)",
  },
});

const highlightStyle = HighlightStyle.define([
  { tag: t.tagName, color: "var(--xml-color-tag)" },
  { tag: t.attributeName, color: "var(--xml-color-attr-name)" },
  { tag: [t.attributeValue, t.string], color: "var(--xml-color-attr-value)" },
  { tag: t.comment, color: "var(--xml-color-comment)" },
  { tag: t.processingInstruction, color: "var(--xml-color-pi)" },
  { tag: t.special(t.string), color: "var(--xml-color-cdata)" },
  { tag: t.content, color: "var(--xml-color-text)" },
  { tag: [t.angleBracket, t.punctuation], color: "var(--xml-color-punct)" },
  { tag: t.docType, color: "var(--xml-color-doctype)" },
]);

export const editorTheme: Extension = [baseTheme, syntaxHighlighting(highlightStyle)];
