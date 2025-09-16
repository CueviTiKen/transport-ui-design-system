import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import VisuallyHidden from "./VisuallyHidden";
import { normalizeStr } from "../../utils/normalize";
import { useDebouncedValue } from "../../utils/useDebouncedValue";

/**
 * Combobox accesible (ARIA 1.2) sin dependencias.
 * Props:
 * - options: string[]  (lista de opciones)
 * - value: string      (valor controlado)
 * - onChange: (val: string) => void
 * - placeholder?: string
 * - id?: string  (lo inyecta Field si se usa dentro)
 * - highlightOnOpen?: boolean  // Si true, pinta la barra superior en naranja al abrir (controlado por CSS)
 * - ...ariaProps (aria-describedby, aria-invalid, required, etc. -> Field los pasa)
 */
export default function Combobox({
  options = [],
  value,
  onChange,
  placeholder,
  id,
  highlightOnOpen = false,
  ...ariaProps
}) {
  const uid = useId().replace(/:/g, ""); // evita ':' en ids en algunos navegadores
  const listId = `cb-list-${uid}`;
  const inputId = id || `cb-in-${uid}`;
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Filtro tolerante a tildes y case-insensitive (con debounce)
  const debouncedQuery = useDebouncedValue(value || "", 120);
  const filtered = useMemo(() => {
    const q = normalizeStr(debouncedQuery);
    if (!q) return options.slice(0, 50);
    return options.filter((opt) => normalizeStr(opt).includes(q)).slice(0, 50);
  }, [options, debouncedQuery]);

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const liveRef = useRef(null);

  // Anuncio de resultados (SR)
  useEffect(() => {
    if (!open) return;
    const count = filtered.length;
    if (liveRef.current) {
      liveRef.current.textContent = count
        ? `${count} resultado${count === 1 ? "" : "s"} disponibles`
        : "Sin resultados";
    }
  }, [filtered.length, open]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const onDocDown = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  // Teclado
  const onKeyDown = (e) => {
    const count = filtered.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(0);
      } else {
        setActiveIndex((i) => (i + 1 < count ? i + 1 : count - 1));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(count - 1);
      } else {
        setActiveIndex((i) => (i - 1 >= 0 ? i - 1 : 0));
      }
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < count) {
        e.preventDefault();
        commitSelection(filtered[activeIndex]);
      }
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  const commitSelection = (val) => {
    onChange?.(val);
    setOpen(false);
    setActiveIndex(-1);
    if (liveRef.current) liveRef.current.textContent = `Seleccionado: ${val}`;
    inputRef.current?.focus();
  };

  const onInputChange = (e) => {
    onChange?.(e.target.value);
    setOpen(true);
    setActiveIndex(-1);
  };

  const onOptionMouseEnter = (i) => setActiveIndex(i);

  const activeId =
    open && activeIndex >= 0
      ? `${listId}-opt-${activeIndex}`
      : undefined;

  return (
    <div
      className="combo"
      ref={containerRef}
      data-open={open ? "1" : "0"}
      data-highlight={highlightOnOpen ? "true" : undefined}
    >
      <div className="combo-wrapper">
        <span className="combo-arrow">▼</span>
        <input
          ref={inputRef}
          id={inputId}
          className="combo-input"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open ? "true" : "false"}
          aria-controls={listId}
          aria-activedescendant={activeId}
          placeholder={placeholder}
          value={value || ""}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          autoComplete="off"
          spellCheck={false}
          {...ariaProps}
        />
      </div>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          className="combo-list"
        >
          {filtered.length === 0 && (
            <li className="combo-empty" aria-live="polite">
              Sin resultados
            </li>
          )}
          {filtered.map((opt, i) => {
            const optId = `${listId}-opt-${i}`;
            const isActive = i === activeIndex;
            return (
              <li
                id={optId}
                key={optId}
                role="option"
                aria-selected={isActive ? "true" : "false"}
                data-active={isActive ? "true" : undefined}
                className="combo-option"
                onMouseEnter={() => onOptionMouseEnter(i)}
                onMouseDown={(ev) => {
                  // mousedown para evitar blur del input antes del click
                  ev.preventDefault();
                  commitSelection(opt);
                }}
              >
                {opt}
              </li>
            );
          })}
        </ul>
      )}

      {/* Región viva para mensajes cortos */}
      <VisuallyHidden as="div" aria-live="polite" ref={liveRef} />
    </div>
  );
}
