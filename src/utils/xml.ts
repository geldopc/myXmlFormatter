export type ProcessResult = {
  value: string;
  error: string | null;
};

export type SanitizeResult = {
  value: string;
  removedCount: number;
  fixedCdataCount: number;
};

export function sanitizeXml(xml: string): SanitizeResult {
  let removedCount = 0;
  // Strip malformed pseudo-comments: <-- ... --> (missing the ! after <)
  const cleaned = xml.replace(/<--[\s\S]*?-->/g, () => {
    removedCount++;
    return "";
  });
  // Collapse excessive blank lines left behind by removals
  const collapsed = cleaned.replace(/\n{3,}/g, "\n\n");

  // Auto-close CDATA sections that are missing the ]]> closing marker.
  // Matches <![CDATA[ followed by content with no ]]> before the parent closing tag.
  let fixedCdataCount = 0;
  const fixed = collapsed.replace(
    /<!\[CDATA\[((?:(?!\]\]>)[\s\S])*?)(<\/)/g,
    (_match, content, closeTag) => {
      fixedCdataCount++;
      return `<![CDATA[${content}]]>${closeTag}`;
    }
  );

  return { value: fixed, removedCount, fixedCdataCount };
}

export function formatXml(input: string): ProcessResult {
  const trimmed = input.trim();
  if (!trimmed) return { value: "", error: "Input is empty" };

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, "text/xml");
    const parseError = doc.querySelector("parsererror");

    if (parseError) {
      const msg = parseError.textContent ?? "Invalid XML";
      return { value: "", error: msg.split("\n")[0].trim() };
    }

    return { value: prettify(doc), error: null };
  } catch (e) {
    return { value: "", error: (e as Error).message };
  }
}

export function minifyXml(input: string): ProcessResult {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input.trim(), "text/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) return { value: "", error: "Invalid XML" };

    const serializer = new XMLSerializer();
    const raw = serializer.serializeToString(doc);
    return { value: raw.replace(/>\s+</g, "><").trim(), error: null };
  } catch (e) {
    return { value: "", error: (e as Error).message };
  }
}

function prettify(node: Node, depth = 0): string {
  const indent = "  ".repeat(depth);
  const lines: string[] = [];

  if (node.nodeType === Node.DOCUMENT_NODE) {
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    node.childNodes.forEach((child) => {
      lines.push(prettify(child, depth));
    });
    return lines.join("\n");
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const attrs = Array.from(el.attributes)
      .map((a) => ` ${a.name}="${a.value}"`)
      .join("");
    const tag = `${el.tagName}${attrs}`;

    const children = Array.from(el.childNodes).filter(
      (n) => !(n.nodeType === Node.TEXT_NODE && n.textContent?.trim() === "")
    );

    if (children.length === 0) {
      lines.push(`${indent}<${tag} />`);
    } else if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
      lines.push(`${indent}<${tag}>${children[0].textContent}</${el.tagName}>`);
    } else {
      lines.push(`${indent}<${tag}>`);
      children.forEach((child) => lines.push(prettify(child, depth + 1)));
      lines.push(`${indent}</${el.tagName}>`);
    }
  } else if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (text) lines.push(`${indent}${text}`);
  } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
    lines.push(`${indent}<![CDATA[${node.textContent}]]>`);
  } else if (node.nodeType === Node.COMMENT_NODE) {
    lines.push(`${indent}<!-- ${node.textContent?.trim()} -->`);
  }

  return lines.join("\n");
}
