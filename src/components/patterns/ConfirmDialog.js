import React from "react";
import Dialog from "../ui/Dialog";

/**
 * Confirmación genérica basada en Dialog
 * Props:
 *  - open, title, description
 *  - confirmLabel?: string
 *  - onCancel: () => void
 *  - onConfirm: () => void
 */
export default function ConfirmDialog({
  open, title, description, confirmLabel = "Confirmar", onCancel, onConfirm
}) {
  return (
    <Dialog open={open} onClose={onCancel} title={title}>
      <p>{description}</p>
      <div style={{ display:"flex", gap:".5rem", marginTop:"1rem" }}>
        <button type="button" className="btn" onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
      </div>
    </Dialog>
  );
}
