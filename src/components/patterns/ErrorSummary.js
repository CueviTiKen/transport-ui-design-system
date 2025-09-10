import React, { useEffect, useRef } from "react";

export default function ErrorSummary({ title = "Corrige los errores", errors = [] }) {
  const ref = useRef(null);

  useEffect(() => {
    if (errors.length) ref.current?.focus();
  }, [errors.length]);

  if (!errors.length) return null;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-labelledby="errsum-title"
      style={{
        border: "2px solid #b91c1c",
        padding: "1rem",
        borderRadius: "8px",
        marginBottom: "1rem"
      }}
    >
      <h2 id="errsum-title" style={{ marginTop: 0 }}>
        {title}
      </h2>
      <ul>
        {errors.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              onClick={(ev) => {
                ev.preventDefault();
                const el = document.getElementById(e.id);
                if (el) el.focus();
              }}
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
