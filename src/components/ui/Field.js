import React, { useId, useState } from "react";

/**
 * Field con soporte de "etiqueta dentro" (placeholder).
 *
 * Props extra:
 *  - labelInside?: boolean  → si true, la <label> se oculta visualmente
 *    y el placeholder del control pasa a ser el propio "label".
 */
export default function Field({
  label,
  help,
  error,
  id,
  children,
  required,
  hintId,
  errorId,
  labelInside = false
}) {
  const genId = useId();
  const fieldId = id || `f-${genId}`;
  const helpElId = hintId || `h-${genId}`;
  const errElId = errorId || `e-${genId}`;
  const [isFocused, setIsFocused] = useState(false);

  const describedBy = [
    help ? helpElId : null,
    error ? errElId : null
  ].filter(Boolean).join(" ") || undefined;

  // Determinamos si es un Combobox para no inyectarle la clase ui-input
  const isCombobox = children.props.className?.includes('combo-input');

  // Merge de clases solo si no es Combobox
  const childClass = !isCombobox ? [
    children.props.className,
    "ui-input",
    labelInside ? "ui-input--pill" : null
  ].filter(Boolean).join(" ") : children.props.className;

  // Estilos inline cuando está focused (solo si no es Combobox)
  const focusStyles = !isCombobox && isFocused ? {
    backgroundColor: 'var(--accent)',
    color: 'var(--on-accent)',
    borderColor: 'var(--accent)',
    caretColor: 'var(--on-accent)',
    transition: 'all 0.1s ease-out',  // Añadimos la transición
  } : {
    // Añadimos los estilos base para que la transición funcione en ambas direcciones
    transition: 'all 0.1s ease-out',
  };

  // Actualizamos los estilos del placeholder para incluir la transición
  const placeholderStyles = `
    #${fieldId}::placeholder {
      transition: color 0.s ease-out;
      ${!isCombobox && isFocused ? `
        color: var(--on-accent) !important;
        opacity: 0.9;
      ` : ''}
    }
  `;

  const control = React.cloneElement(children, {
    id: fieldId,
    "aria-describedby": describedBy,
    "aria-invalid": error ? "true" : undefined,
    required: required || undefined,
    className: childClass,
    // En modo "inside", forzamos placeholder = label
    placeholder: labelInside ? label : children.props.placeholder,
    style: {
      ...children.props.style,
      ...focusStyles
    }
  });

  return (
    <div 
      className="field"
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
    >
      {/* Añadimos un elemento style para los estilos del placeholder */}
      <style>{placeholderStyles}</style>

      <label
        htmlFor={fieldId}
        className={labelInside ? "visually-hidden" : undefined}
      >
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
