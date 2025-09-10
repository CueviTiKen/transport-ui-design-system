import React from "react";

/**
 * Alert/Banner accesible.
 * - Tono: "info" | "success" | "warning" | "error"
 * - Rol ARIA: "alert" para error, "status" para el resto (anuncio no intrusivo).
 * - Título opcional y contenido (children).
 * - Acción/Enlace opcional.
 */
export default function Alert({ tone = "info", title, children, action }) {
  const role = tone === "error" ? "alert" : "status";
  return (
    <div className="alert" data-tone={tone} role={role}>
      <div className="alert__icon" aria-hidden="true">
        {tone === "success" ? "✔️" : tone === "warning" ? "⚠️" : tone === "error" ? "⛔" : "ℹ️"}
      </div>
      <div className="alert__content">
        {title && <h3 className="alert__title">{title}</h3>}
        {children && <div className="alert__desc">{children}</div>}
        {action && (
          <div className="alert__action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
