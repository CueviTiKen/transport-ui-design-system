import React, { useState, useRef, useEffect } from "react";

const TARIFAS = [
  { value: "normal", label: "Normal" },
  { value: "joven",  label: "Jóven"  },
  { value: "prm",    label: "PMR"    }
];

export default function TarifaSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // cerrar al hacer click fuera o con Escape
  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey  = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  const handleSelect = (val) => {
    onChange?.(val);
    setOpen(false);
  };

  return (
    <div className="tarifa" data-open={open ? 1 : 0} ref={ref}>
      <div className="tarifa-wrapper">
        <button
          type="button"
          className="tarifa-trigger"
          onClick={() => setOpen(v => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {TARIFAS.find(t => t.value === value)?.label || "Seleccione tarifa"}
        </button>
        <span className="tarifa-arrow">▼</span>
      </div>

      {open && (
        <ul className="tarifa-list" role="listbox">
          {TARIFAS.map(t => (
            <li
              key={t.value}
              className="tarifa-option"
              role="option"
              aria-selected={value === t.value}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(t.value); }}
              tabIndex={0}
            >
              {t.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
