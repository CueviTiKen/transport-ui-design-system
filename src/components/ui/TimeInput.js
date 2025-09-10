import React, { useRef } from "react";
import { addMinutes, formatHHMM, parseHHMM } from "../../utils/time";

/**
 * TimeInput accesible (24h) sin librerías.
 * - Acepta "HH:MM" (normaliza al salir del campo).
 * - Flechas ↑/↓ para sumar/restar minutos (step configurable).
 *   • Shift + ↑/↓ cambia de hora (+/- 60)
 *
 * Props:
 *  - value: string ("HH:MM")
 *  - onChange: (val: string) => void
 *  - id?: string
 *  - placeholder?: string (p.ej. "12:30")
 *  - step?: number (minutos, por defecto 5)
 *  - ...ariaProps (id, aria-describedby, aria-invalid, required lo inyecta Field)
 */
export default function TimeInput({
  value,
  onChange,
  id,
  placeholder = "HH:MM",
  step = 5,
  ...ariaProps
}) {
  const ref = useRef(null);

  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleBlur = () => {
    const parsed = parseHHMM(value);
    if (parsed) {
      onChange?.(formatHHMM(parsed.h, parsed.m));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

    const parsed = parseHHMM(value || "");
    const base = parsed ? [parsed.h, parsed.m] : [12, 0];
    const delta = e.shiftKey ? 60 : (e.key === "ArrowUp" ? step : -step);
    const [h, m] = addMinutes(base[0], base[1], e.key === "ArrowUp" ? Math.abs(delta) : -Math.abs(delta));

    e.preventDefault();
    onChange?.(formatHHMM(h, m));
    // mantiene el foco
    ref.current?.focus();
  };

  return (
    <input
      ref={ref}
      id={id}
      className="time-input__text"
      inputMode="numeric"
      placeholder={placeholder}
      value={value || ""}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      spellCheck={false}
      aria-label={ariaProps["aria-label"]}
      {...ariaProps}
    />
  );
}
