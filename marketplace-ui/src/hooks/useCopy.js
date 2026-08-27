import { useCallback, useState } from "react";
import { copyToClipboard } from "../lib/clipboard.js";
import { useToast } from "../context/ToastContext.jsx";

// Shared copy-to-clipboard behavior: the triggering button gets its own
// "Copied" state for ~2s, and a toast confirms it regardless of which
// button was clicked.
export function useCopy() {
  const [copiedId, setCopiedId] = useState(null);
  const notify = useToast();

  const copy = useCallback(
    async (text, id) => {
      await copyToClipboard(text);
      setCopiedId(id);
      notify("Copied to clipboard");
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 2000);
    },
    [notify]
  );

  return { copiedId, copy };
}
