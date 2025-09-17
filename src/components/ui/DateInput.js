import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  addMonths,
  buildCalendar,
  clampToMonth,
  formatDMY,
  isSameDay,
  parseDMY
} from "../../utils/date";
import CalendarIcon from "./CalendarIcon";

/**
 * DateInput con calendario accesible (sin librerías).
 * - Texto editable (dd/mm/aaaa) + popover de calendario navegable con teclado.
 * - Roles ARIA: grid, gridcell; aria-selected; aria-current="date"; botones prev/next.
 * - Navegación: Flechas mueve día; PageUp/Down cambia mes; Home/End a inicio/fin de semana; Enter selecciona; Esc cierra.
 */
export default function DateInput({
  id,
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  ...ariaProps
}) {
  const cid = useId().replace(/:/g, "");
  const inputRef = useRef(null);
  const popRef = useRef(null);
  const [open, setOpen] = useState(false);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const selectedDate = useMemo(() => parseDMY(value), [value]);
  const [viewMonth, setViewMonth] = useState(clampToMonth(selectedDate || today));

  // Cierra al hacer click fuera
  useEffect(() => {
    const onDocDown = (e) => {
      if (!open) return;
      if (popRef.current && !popRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  // Abre y sincroniza mes
  const openCalendar = () => {
    setViewMonth(clampToMonth(selectedDate || today));
    setOpen(true);
    setTimeout(() => {
      const grid = popRef.current?.querySelector(".datepicker__grid");
      grid?.focus();
    }, 0);
  };

  const onInputChange = (e) => {
    const val = e.target.value;
    onChange?.(val);
  };

  const onInputKeyDown = (e) => {
    if ((e.altKey && e.key === "ArrowDown") || e.key === "Enter") {
      e.preventDefault();
      openCalendar();
    } else if (e.key === "Escape" && open) {
      setOpen(false);
    }
  };

  return (
    <div className="date-input">
      <div className="date-input__row">
        <input
          ref={inputRef}
          id={id || cid}
          className={`date-input__text${open ? " date-input__text--active" : ""}`}
          inputMode="numeric"
          placeholder={placeholder}
          value={value || ""}
          onChange={onInputChange}
          onKeyDown={onInputKeyDown}
          autoComplete="off"
          spellCheck={false}
          {...ariaProps}
        />
        <button
          className="date-input__button"
          type="button"
          aria-label="Abrir calendario"
          onClick={() => (open ? setOpen(false) : openCalendar())}
        >
          <CalendarIcon size={28} />
        </button>
      </div>

      {open && (
        <DatePickerPopover
          ref={popRef}
          monthDate={viewMonth}
          onPrevMonth={() => setViewMonth((d) => addMonths(d, -1))}
          onNextMonth={() => setViewMonth((d) => addMonths(d, +1))}
          onSelect={(d) => {
            onChange?.(formatDMY(d));
            setOpen(false);
            inputRef.current?.focus();
          }}
          selectedDate={selectedDate}
          today={today}
        />
      )}
    </div>
  );
}

const DatePickerPopover = React.forwardRef(function DatePickerPopover(
  { monthDate, onPrevMonth, onNextMonth, onSelect, selectedDate, today },
  ref
) {
  const gridRef = useRef(null);
  const titleId = useRef(`dp-title-${Math.random().toString(36).slice(2,8)}`).current;
  const [active, setActive] = useState(selectedDate || today);

  useEffect(() => {
    setActive(selectedDate || today);
  }, [selectedDate, today, monthDate]);

  // Construye 6x7 celdas
  const days = useMemo(() => buildCalendar(monthDate), [monthDate]);

  // Teclado dentro de la rejilla
  const onGridKeyDown = (e) => {
    const key = e.key;
    const next = new Date(active);
    if (key === "ArrowRight") {
      next.setDate(active.getDate() + 1);
      e.preventDefault();
    } else if (key === "ArrowLeft") {
      next.setDate(active.getDate() - 1);
      e.preventDefault();
    } else if (key === "ArrowDown") {
      next.setDate(active.getDate() + 7);
      e.preventDefault();
    } else if (key === "ArrowUp") {
      next.setDate(active.getDate() - 7);
      e.preventDefault();
    } else if (key === "Home") {
      // lunes
      const day = (active.getDay() + 6) % 7; // 0..6 (lun..dom)
      next.setDate(active.getDate() - day);
      e.preventDefault();
    } else if (key === "End") {
      const day = (active.getDay() + 6) % 7;
      next.setDate(active.getDate() + (6 - day));
      e.preventDefault();
    } else if (key === "PageUp") {
      next.setMonth(active.getMonth() - 1);
      e.preventDefault();
    } else if (key === "PageDown") {
      next.setMonth(active.getMonth() + 1);
      e.preventDefault();
    } else if (key === "Enter") {
      onSelect(active);
      e.preventDefault();
      return;
    } else if (key === "Escape") {
      // el DateInput cerrará por click fuera; aquí solo blureamos
      gridRef.current?.blur();
      return;
    } else {
      return;
    }
    setActive(next);

    // Cambia de vista de mes si sales de límites
    if (next.getMonth() !== monthDate.getMonth() || next.getFullYear() !== monthDate.getFullYear()) {
      if (next < monthDate) onPrevMonth();
      else onNextMonth();
    }
  };

  return (
    <div ref={ref} className="datepicker" role="dialog" aria-label="Selector de fecha">
      <div className="datepicker__header">
        <button
          type="button"
          className="btn"
          aria-label="Mes anterior"
          onClick={onPrevMonth}
        >
          ◀
        </button>
        <div className="datepicker__title" id={titleId} aria-live="polite">
          {monthDate.toLocaleDateString("es-ES", { month: "long" })}
        </div>
        <button
          type="button"
          className="btn"
          aria-label="Mes siguiente"
          onClick={onNextMonth}
        >
          ▶
        </button>
      </div>

      <div
        className="datepicker__grid"
        role="grid"
        aria-labelledby={titleId}
        tabIndex={0}
        ref={gridRef}
        onKeyDown={onGridKeyDown}
      >
        {/* cabecera */}
        <div className="datepicker__row" role="row">
          {["lu","ma","mi","ju","vi","sá","do"].map(d => (
            <div key={d} className="datepicker__cell datepicker__cell--head" role="columnheader">{d}</div>
          ))}
        </div>

        {/* 6 semanas */}
        {Array.from({ length: 6 }, (_, w) => (
          <div className="datepicker__row" role="row" key={w}>
            {days.slice(w * 7, w * 7 + 7).map((d) => {
              const inMonth = d.getMonth() === monthDate.getMonth();
              const isToday = isSameDay(d, today);
              const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
              const isActive = isSameDay(d, active);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected ? "true" : "false"}
                  aria-current={isToday ? "date" : undefined}
                  className="datepicker__cell"
                  data-out={!inMonth ? "1" : undefined}
                  data-today={isToday ? "1" : undefined}
                  data-selected={isSelected ? "1" : undefined}
                  data-active={isActive ? "1" : undefined}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => onSelect(d)}
                  onFocus={() => setActive(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="datepicker__help">
        <span>Flechas mueve • Enter selecciona • PgUp/PgDn cambia mes • Esc cierra</span>
      </div>
    </div>
  );
});
