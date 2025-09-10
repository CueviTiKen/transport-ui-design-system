import React from "react";

/**
 * TextInput básico con soporte:
 *  - type (text/email/etc.)
 *  - onlyDigits: filtra todo lo no numérico en onChange
 *  - inputMode/pattern personalizables
 */
export default function TextInput({
  id,
  value,
  onChange,
  type = "text",
  placeholder = "",
  onlyDigits = false,
  inputMode,
  pattern,
  ...rest
}) {
  const handleChange = (e) => {
    let v = e.target.value;
    if (onlyDigits) v = v.replace(/\D+/g, "");
    onChange?.({ ...e, target: { ...e.target, value: v } });
  };

  const extra = {};
  if (onlyDigits) {
    extra.inputMode = "numeric";
    extra.pattern = "[0-9]*";
  }
  if (inputMode) extra.inputMode = inputMode;
  if (pattern) extra.pattern = pattern;

  return (
    <input
      id={id}
      className="date-input__text"
      type={type}
      value={value ?? ""}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      {...extra}
      {...rest}
    />
  );
}
