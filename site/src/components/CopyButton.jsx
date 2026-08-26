import { useState } from "react";

export default function CopyButton({ text, className = "copy-button", label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable (e.g. insecure context) — nothing to fall back to.
    }
  };

  return (
    <button className={className} onClick={copy}>
      {copied ? "Copied" : label}
    </button>
  );
}
