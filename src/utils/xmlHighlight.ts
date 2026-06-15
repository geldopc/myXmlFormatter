function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function span(cssVar: string, content: string): string {
  return `<span style="color:var(${cssVar})">${content}</span>`;
}

export function highlightXml(xml: string): string {
  let result = "";
  let i = 0;

  while (i < xml.length) {
    // Comment
    if (xml.startsWith("<!--", i)) {
      const end = xml.indexOf("-->", i + 4);
      const close = end === -1 ? xml.length : end + 3;
      result += span("--xml-color-comment", escapeHtml(xml.slice(i, close)));
      i = close;
      continue;
    }

    // CDATA
    if (xml.startsWith("<![CDATA[", i)) {
      const end = xml.indexOf("]]>", i + 9);
      const close = end === -1 ? xml.length : end + 3;
      result += span("--xml-color-cdata", escapeHtml(xml.slice(i, close)));
      i = close;
      continue;
    }

    // DOCTYPE
    if (xml.slice(i, i + 9).toUpperCase() === "<!DOCTYPE") {
      const end = xml.indexOf(">", i);
      const close = end === -1 ? xml.length : end + 1;
      result += span("--xml-color-doctype", escapeHtml(xml.slice(i, close)));
      i = close;
      continue;
    }

    // Processing instruction (including XML declaration)
    if (xml.startsWith("<?", i)) {
      const end = xml.indexOf("?>", i + 2);
      const close = end === -1 ? xml.length : end + 2;
      result += span("--xml-color-pi", escapeHtml(xml.slice(i, close)));
      i = close;
      continue;
    }

    // Closing tag
    if (xml.startsWith("</", i)) {
      const end = xml.indexOf(">", i + 2);
      const close = end === -1 ? xml.length : end + 1;
      const inner = xml.slice(i + 2, close - 1);
      result +=
        span("--xml-color-punct", "&lt;/") +
        span("--xml-color-tag", escapeHtml(inner)) +
        span("--xml-color-punct", "&gt;");
      i = close;
      continue;
    }

    // Opening tag (starts with < followed by a letter)
    if (xml[i] === "<" && i + 1 < xml.length && /[a-zA-Z_:]/.test(xml[i + 1])) {
      result += span("--xml-color-punct", "&lt;");
      i += 1;

      // Tag name
      let j = i;
      while (j < xml.length && !/[\s/>]/.test(xml[j])) j++;
      result += span("--xml-color-tag", escapeHtml(xml.slice(i, j)));
      i = j;

      // Attributes
      while (i < xml.length && xml[i] !== ">" && !(xml[i] === "/" && xml[i + 1] === ">")) {
        // Whitespace
        if (/\s/.test(xml[i])) {
          result += xml[i];
          i++;
          continue;
        }

        // Attribute name
        const nameStart = i;
        while (i < xml.length && xml[i] !== "=" && xml[i] !== ">" && !/\s/.test(xml[i])) i++;
        result += span("--xml-color-attr-name", escapeHtml(xml.slice(nameStart, i)));

        // Attribute value
        if (xml[i] === "=") {
          result += span("--xml-color-punct", "=");
          i++;
          if (i < xml.length && (xml[i] === '"' || xml[i] === "'")) {
            const quote = xml[i];
            const valStart = i;
            i++;
            while (i < xml.length && xml[i] !== quote) i++;
            if (i < xml.length) i++; // consume closing quote
            result += span("--xml-color-attr-value", escapeHtml(xml.slice(valStart, i)));
          }
        }
      }

      // Close /> or >
      if (xml[i] === "/" && xml[i + 1] === ">") {
        result += span("--xml-color-punct", "/&gt;");
        i += 2;
      } else if (xml[i] === ">") {
        result += span("--xml-color-punct", "&gt;");
        i += 1;
      }
      continue;
    }

    // Text content — consume until next <
    const nextTag = xml.indexOf("<", i);
    const textEnd = nextTag === -1 ? xml.length : nextTag;
    const text = xml.slice(i, textEnd);
    if (text.length > 0) {
      result += span("--xml-color-text", escapeHtml(text));
    }
    i = textEnd;
  }

  return result;
}
