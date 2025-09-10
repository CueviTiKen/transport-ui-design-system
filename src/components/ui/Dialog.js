import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Dialog/Modal accesible sin librerías.
 * - Focus trap interno, cierre con Esc y click en el fondo.
 * - ARIA: role="dialog", aria-modal, aria-labelledby, aria-describedby.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title: string
 *  - children: ReactNode
 *  - descriptionId?: string (para aria-describedby)
 */
export default function Dialog({ open, onClose, title, children, descriptionId }) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const prevFocusRef = useRef(null);

  // 🔧 Generamos el id del título ANTES de cualquier return (los hooks deben ser incondicionales)
  const titleId = useStableId("dlg-title");
  const descId = descriptionId || undefined;

  // Cerrar con tecla Escape + focus trap con Tab
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key === "Tab") {
        const focusables = getFocusable(panelRef.current);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Guardar/restaurar foco + enfocar primer elemento al abrir
  useEffect(() => {
    if (!open) return;
    prevFocusRef.current = document.activeElement;

    const toFocus = getFocusable(panelRef.current)[0] || panelRef.current;
    toFocus?.focus({ preventScroll: true });

    return () => {
      if (prevFocusRef.current && typeof prevFocusRef.current.focus === "function") {
        prevFocusRef.current.focus({ preventScroll: true });
      }
    };
  }, [open]);

  // Si no está abierto, no renderiza nada
  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose?.();
  };

  return createPortal(
    <div
      ref={backdropRef}
      className="dialog-backdrop"
      onMouseDown={handleBackdropClick}
      /* No uses aria-hidden aquí, ocultaría también el diálogo */
    >
      <div
        ref={panelRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="dialog__header">
          <h2 id={titleId} className="dialog__title">{title}</h2>
          <button type="button" className="btn dialog__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="dialog__body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Devuelve elementos focalizables dentro de root */
function getFocusable(root) {
  if (!root) return [];
  const SEL = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",");
  const nodes = Array.from(root.querySelectorAll(SEL));
  return nodes.filter((el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
}

/** Hook para id estable por render */
function useStableId(prefix) {
  const ref = useRef(`${prefix}-${Math.random().toString(36).slice(2, 8)}`);
  return ref.current;
}
