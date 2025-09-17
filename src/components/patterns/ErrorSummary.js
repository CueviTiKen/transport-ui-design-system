import React, { useEffect, useRef } from "react";

export default function ErrorSummary({
  title = "Corrige los errores",
  errors = [],
}) {
  const ref = useRef(null);

  // Al aparecer, lleva el foco al contenedor
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
      className="error-summary"
    >
      <div className="error-summary__header">
        <h2 id="errsum-title" className="error-summary__title">
          {title}
        </h2>
      </div>

      <div className="error-summary__body">
        <ul className="error-summary__list">
          {errors.map((e) => (
            <li key={e.id} className="error-summary__item">
              <a
                className="error-summary__link"
                href={`#${e.id}`}
                onClick={(ev) => {
                  ev.preventDefault();
                  const el = document.getElementById(e.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" }); // mueve al inicio del viewport
                    setTimeout(() => el.focus(), 400); // espera a que termine el scroll antes de hacer focus
                  }
                }}
              >
                {e.message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
