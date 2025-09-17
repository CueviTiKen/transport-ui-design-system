import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * SeatSelector accesible.
 * - No permite seleccionar asientos "reserved" ni "occupied" (también los salta con flechas).
 * - Al seleccionar un asiento, el borde se muestra azul (ver CSS adjunto).
 */
export default function SeatSelector({
  id,
  rows = 6,
  cols = 4,
  aisleAfter = 2,
  occupied = [],
  reserved = [],
  value = null,
  onChange
}) {
  const letters = useMemo(
    () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, rows).split(""),
    [rows]
  );

  const seats = useMemo(() => {
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const sid = `${letters[r]}${c + 1}`;
        let status = "free";
        if (occupied.includes(sid) || reserved.includes(sid)) status = "occupied";
        row.push({ id: sid, status, r, c });
      }
      grid.push(row);
    }
    return grid;
  }, [rows, cols, letters, occupied, reserved]);

  const gridRef = useRef(null);
  const [active, setActive] = useState(value || (seats[0]?.[0]?.id ?? null));

  // si cambia value desde fuera, sincroniza el "active"
  useEffect(() => {
    if (value) setActive(value);
  }, [value]);

  // al enfocar el grid, mueve el foco DOM al asiento activo
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onFocus = (e) => {
      if (e.target === el) {
        const btn = el.querySelector('[data-active="1"]');
        if (btn) btn.focus();
      }
    };
    el.addEventListener("focus", onFocus, true);
    return () => el.removeEventListener("focus", onFocus, true);
  }, []);

  const isDisabledId = (sid) =>
    occupied.includes(sid) || reserved.includes(sid);

  const seatAt = (r, c) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return seats[r][c];
  };

  const parseId = (sid) => {
    const m = String(sid).match(/^([A-Z])(\d+)$/);
    if (!m) return { r: 0, c: 0 };
    const r = m[1].charCodeAt(0) - 65;
    const c = Number(m[2]) - 1;
    return { r, c };
  };

  // mueve el "asiento activo" saltando los no seleccionables
  const setNextActive = (dr, dc) => {
    if (!active) return;
    const { r, c } = parseId(active);
    let nr = r;
    let nc = c;

    // avanza paso a paso en la dirección dada hasta hallar uno libre
    while (true) {
      nr += dr;
      nc += dc;
      const cell = seatAt(nr, nc);
      if (!cell) {
        // si salimos de límites, mantenemos el actual
        return;
      }
      if (!isDisabledId(cell.id)) {
        setActive(cell.id);
        return;
      }
      // si está deshabilitado, seguimos buscando en la misma dirección
    }
  };

  const onKeyDown = (e, sid) => {
    const key = e.key;
    if (key === " " || key === "Enter") {
      e.preventDefault();
      toggleSelect(sid);
      return;
    }
    if (key === "ArrowUp") {
      e.preventDefault();
      setNextActive(-1, 0);
    }
    if (key === "ArrowDown") {
      e.preventDefault();
      setNextActive(1, 0);
    }
    if (key === "ArrowLeft") {
      e.preventDefault();
      setNextActive(0, -1);
    }
    if (key === "ArrowRight") {
      e.preventDefault();
      setNextActive(0, 1);
    }
  };

  const toggleSelect = (sid) => {
    // Bloquea selección de ocupados/reservados
    if (isDisabledId(sid)) return;
    onChange?.(value === sid ? null : sid);
  };

  // Plantilla dinámica de columnas (izquierda, pasillo, derecha)
  const left = Math.max(0, Math.min(cols, aisleAfter));
  const right = Math.max(0, cols - left);
  const template = `repeat(${left}, 40px) 24px repeat(${right}, 40px)`;

  return (
    <div className="seatmap">
      <div className="seatmap__legend" aria-hidden="true">
        <span className="seat" data-status="selected" style={{ width: 16, height: 16 }} />
        <small>Seleccionado</small>
        <span className="seat" data-status="occupied" style={{ width: 16, height: 16 }} />
        <small>Ocupado</small>
      </div>

      <div
        id={id}
        ref={gridRef}
        role="grid"
        aria-label="Mapa de asientos"
        className="seatmap__grid"
        tabIndex={-1}
      >
        {seats.map((row, idxRow) => (
          <div
            key={idxRow}
            className="seatmap__row"
            role="row"
            style={{ display: "grid", gridTemplateColumns: template, alignItems: "center", gap: ".4rem" }}
          >
            {row.map((cell, idxCol) => {
              const isAisleAfter = idxCol + 1 === left;
              const activeAttr = active === cell.id ? 1 : 0;
              const isSelected = value === cell.id;
              const disabled = cell.status === "occupied" || cell.status === "reserved";

              return (
                <React.Fragment key={cell.id}>
                  <button
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected}
                    aria-disabled={disabled}
                    className="seat"
                    data-status={isSelected ? "selected" : cell.status}
                    data-active={activeAttr}
                    onClick={() => toggleSelect(cell.id)}
                    onKeyDown={(e) => onKeyDown(e, cell.id)}
                    onFocus={() => setActive(cell.id)}
                    title={cell.id}
                  >
                    {cell.id}
                  </button>
                  {isAisleAfter && <span aria-hidden="true" className="seatmap__aisle" />}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
