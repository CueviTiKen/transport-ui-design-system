import React, { useId } from "react";

export default function Field({
  label,
  help,
  error,
  id,
  children,
  required,
  hintId,
  errorId
}) {
  const genId = useId();
  const fieldId = id || `f-${genId}`;
  const helpElId = hintId || `h-${genId}`;
  const errElId = errorId || `e-${genId}`;

  const describedBy = [
    help ? helpElId : null,
    error ? errElId : null
  ].filter(Boolean).join(" ") || undefined;

  const control = React.cloneElement(children, {
    id: fieldId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? "true" : undefined,
    required: required || undefined
  });

  return (
    <div className="field">
      <label htmlFor={fieldId}>
        {label}
        {required ? " *" : ""}
      </label>
      {control}
      {help && <div id={helpElId} className="help">{help}</div>}
      {error && (
        <div id={errElId} className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
