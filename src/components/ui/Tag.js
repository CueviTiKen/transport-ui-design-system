import React from "react";

/**
 * Tag/Pill accesible para estados.
 * Equivalente al color: siempre hay texto visible y título/aria-label.
 */
export default function Tag({ label, tone = "info", title }) {
  return (
    <span
      className="tag"
      data-tone={tone}
      aria-label={label}
      title={title || label}
    >
      {label}
    </span>
  );
}
