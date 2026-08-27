import { useEffect, useMemo, useRef } from "react";
import { marked } from "marked";
import mermaid from "mermaid";

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// marked's default code renderer HTML-escapes and syntax-wraps every fenced
// block. A ```mermaid fence needs its raw source preserved instead, inside a
// plain `<pre class="mermaid">`, so mermaid.run() can find and replace it.
const renderer = new marked.Renderer();
const defaultCode = renderer.code.bind(renderer);
renderer.code = (code, infostring, escaped) => {
  const lang = (infostring || "").trim().split(/\s+/)[0];
  if (lang === "mermaid") {
    return `<pre class="mermaid">${escapeHtml(code)}</pre>`;
  }
  return defaultCode(code, infostring, escaped);
};

let mermaidInitialized = false;
function ensureMermaidInitialized() {
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? "dark" : "default",
    securityLevel: "strict",
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  });
  mermaidInitialized = true;
}

// Renders markdown sourced from this repo's own README.md/SKILL.md/agent
// files (never arbitrary user input — see call sites) into HTML, with
// ```mermaid fences rendered as live diagrams via mermaid.js.
export default function MarkdownBody({ source, className }) {
  const containerRef = useRef(null);
  const html = useMemo(() => marked.parse(source || "", { renderer }), [source]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const nodes = container.querySelectorAll(".mermaid");
    if (nodes.length === 0) return;
    if (!mermaidInitialized) ensureMermaidInitialized();
    // Mermaid measures label text to size nodes; if the webfont hasn't
    // finished loading yet, it measures with a fallback font and the real
    // font (often wider) then clips inside the too-small box once it swaps
    // in. Wait for fonts to be ready first so measurement matches paint.
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(() => mermaid.run({ nodes: Array.from(nodes) })).catch((err) => {
      console.error("Mermaid render failed:", err);
    });
  }, [html]);

  return <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
