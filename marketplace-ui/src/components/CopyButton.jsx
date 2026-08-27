import { useCopy } from "../hooks/useCopy.js";

export default function CopyButton({
  text,
  id,
  className = "copy-btn",
  label = "Copy",
  copiedLabel = "Copied ✓",
}) {
  const { copiedId, copy } = useCopy();
  const copied = copiedId === (id ?? text);

  return (
    <button
      className={`${className}${copied ? " copied" : ""}`}
      onClick={() => copy(text, id ?? text)}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
