import React, { useMemo, useState } from "react";
import Tag from "../ui/Tag";

/**
 * Listado de horarios accesible.
 * - Tabla con <caption>, <thead>, <tbody>.
 * - Ordenación por salida o precio (aria-sort).
 * - Filtros por línea y ocupación.
 * - Estados: loading, error y vacío (con botón Reintentar).
 * - Equivalente al color: texto de ocupación (Baja/Media/Alta).
 *
 * Props:
 *  - items: Array<{ id, line, origin, destination, depart, durationMin, price, occupancy }>
 *           occupancy: "low" | "medium" | "high"
 *  - loading?: boolean
 *  - error?: string | null
 *  - onRetry?: () => void
 *  - onSelect?: (item) => void   // NUEVO: para iniciar checkout
 */
export default function ScheduleList({ items = [], loading = false, error = null, onRetry, onSelect }) {
  const [sortBy, setSortBy] = useState("depart"); // "depart" | "price"
  const [sortDir, setSortDir] = useState("asc");  // "asc" | "desc"
  const [filterLine, setFilterLine] = useState("all");
  const [filterOcc, setFilterOcc] = useState("all"); // "all" | "low" | "medium" | "high"

  // Opciones de líneas
  const lineOptions = useMemo(() => {
    const set = new Set(items.map(i => i.line));
    return ["all", ...Array.from(set).sort((a, b) => String(a).localeCompare(String(b), "es"))];
  }, [items]);

  // Filtrado → Ordenación
  const filtered = useMemo(() => {
    return items.filter(it => {
      const okLine = filterLine === "all" ? true : String(it.line) === String(filterLine);
      const okOcc = filterOcc === "all" ? true : it.occupancy === filterOcc;
      return okLine && okOcc;
    });
  }, [items, filterLine, filterOcc]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      if (sortBy === "depart") {
        const am = toMinutes(a.depart);
        const bm = toMinutes(b.depart);
        return sortDir === "asc" ? am - bm : bm - am;
      }
      if (sortBy === "price") {
        return sortDir === "asc" ? a.price - b.price : b.price - a.price;
      }
      return 0;
    });
    return copy;
  }, [filtered, sortBy, sortDir]);

  const toggleSort = (key) => {
    if (sortBy !== key) {
      setSortBy(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  const ariaSortDepart = sortBy === "depart" ? (sortDir === "asc" ? "ascending" : "descending") : "none";
  const ariaSortPrice  = sortBy === "price"  ? (sortDir === "asc" ? "ascending" : "descending") : "none";

  return (
    <div className="schedule">
      {/* Controles de filtro */}
      <div className="schedule__controls" aria-label="Filtros de horarios">
        <label>
          Línea:
          <select value={filterLine} onChange={(e)=>setFilterLine(e.target.value)} aria-label="Filtrar por línea">
            {lineOptions.map(v => (
              <option key={v} value={v}>{v === "all" ? "Todas" : `#${v}`}</option>
            ))}
          </select>
        </label>

        <label>
          Ocupación:
          <select value={filterOcc} onChange={(e)=>setFilterOcc(e.target.value)} aria-label="Filtrar por ocupación">
            <option value="all">Todas</option>
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </label>
      </div>

      {/* Estado de error */}
      {error && !loading && (
        <div className="schedule__state" role="alert">
          <p style={{ margin: 0 }}><strong>Error:</strong> {error}</p>
          {onRetry && (
            <p style={{ marginTop: ".5rem" }}>
              <button type="button" className="btn" onClick={onRetry}>Reintentar</button>
            </p>
          )}
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="schedule__loading" aria-live="polite">
          <div className="skeleton-row" />
          <div className="skeleton-row" />
          <div className="skeleton-row" />
        </div>
      )}

      {/* Tabla de resultados */}
      {!loading && !error && (
        <table className="table">
          <caption className="table__caption">
            Resultados de horarios (orden por {sortBy === "depart" ? "salida" : "precio"} {sortDir === "asc" ? "ascendente" : "descendente"})
          </caption>
          <thead>
            <tr>
              <th scope="col">Línea</th>
              <th scope="col" aria-sort={ariaSortDepart}>
                <button type="button" className="table__sort" onClick={() => toggleSort("depart")}>
                  Salida <SortIcon active={sortBy === "depart"} dir={sortDir} />
                </button>
              </th>
              <th scope="col">Llegada</th>
              <th scope="col">Origen</th>
              <th scope="col">Destino</th>
              <th scope="col">Duración</th>
              <th scope="col">Ocupación</th>
              <th scope="col" aria-sort={ariaSortPrice}>
                <button type="button" className="table__sort" onClick={() => toggleSort("price")}>
                  Precio <SortIcon active={sortBy === "price"} dir={sortDir} />
                </button>
              </th>
              <th scope="col" className="visually-hidden">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((it) => {
              const arrival = addMinutesToTime(it.depart, it.durationMin);
              const occ = occupancyToTag(it.occupancy);
              return (
                <tr key={it.id}>
                  <th scope="row">#{it.line}</th>
                  <td>{it.depart}</td>
                  <td>{arrival}</td>
                  <td>{it.origin}</td>
                  <td>{it.destination}</td>
                  <td>{formatDuration(it.durationMin)}</td>
                  <td><Tag label={occ.label} tone={occ.tone} /></td>
                  <td>{formatPrice(it.price)}</td>
                  <td>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => onSelect ? onSelect(it) : alert(`Has seleccionado la salida de las ${it.depart}`)}
                    >
                      Seleccionar
                    </button>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "1rem" }}>
                  Sin resultados para los filtros seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}
function addMinutesToTime(hhmm, add) {
  const total = toMinutes(hhmm) + add;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}
function formatPrice(n) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}
function occupancyToTag(level) {
  switch (level) {
    case "low":    return { label: "Ocupación baja",  tone: "success" };
    case "medium": return { label: "Ocupación media", tone: "warning" };
    case "high":   return { label: "Ocupación alta",  tone: "error" };
    default:       return { label: "Desconocida",     tone: "info" };
  }
}
function SortIcon({ active, dir }) {
  return <span aria-hidden="true" className="table__sorticon">{active ? (dir === "asc" ? " ↑" : " ↓") : " ↕"}</span>;
}
