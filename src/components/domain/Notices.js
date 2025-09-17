import React, { useMemo, useState } from "react";
import Alert from "../ui/Alert";
import Boton from "../Boton";

/**
 * Avisos e incidencias (filtrables por severidad, texto, línea y fecha).
 *
 * Props:
 *  - items: Array<{ id, severity: "info"|"warning"|"error"|"success", title, description, url, urlLabel, startsAt?: ISO, line?: string }>
 */
export default function Notices({ items = [] }) {
  const [severity, setSeverity] = useState("all");
  const [q, setQ] = useState("");
  const [line, setLine] = useState("all");
  const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd

  const lineOptions = useMemo(() => {
    const set = new Set(items.filter(n => n.line).map(n => String(n.line)));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b, "es"))];
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const fromTS = fromDate ? Date.parse(fromDate + "T00:00:00") : null;

    return items.filter(n => {
      const okSeverity = severity === "all" ? true : n.severity === severity;
      const okQuery = !query
        ? true
        : (n.title + " " + (n.description || "") + " " + (n.line || "")).toLowerCase().includes(query);
      const okLine = line === "all" ? true : String(n.line || "") === String(line);
      const okDate = fromTS ? (Date.parse(n.startsAt || 0) >= fromTS) : true;
      return okSeverity && okQuery && okLine && okDate;
    });
  }, [items, severity, q, line, fromDate]);

  return (
    <section aria-labelledby="notices-title">
      <div className="notices__controls">
        <h2 id="notices-title" className="notices__title">Avisos e incidencias</h2>

        <div className="notices__filters">
          <label>
            Severidad:
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              aria-label="Filtrar por severidad"
            >
              <option value="all">Todas</option>
              <option value="info">Información</option>
              <option value="warning">Aviso</option>
              <option value="error">Importante</option>
              <option value="success">Resuelto</option>
            </select>
          </label>

          <label>
            Línea:
            <select
              value={line}
              onChange={(e) => setLine(e.target.value)}
              aria-label="Filtrar por línea"
            >
              {lineOptions.map(v => (
                <option key={v} value={v}>{v === "all" ? "Todas" : `#${v}`}</option>
              ))}
            </select>
          </label>

          <label>
            Desde fecha:
            <input
              type="date"
              value={fromDate}
              onChange={(e)=>setFromDate(e.target.value)}
              aria-label="Filtrar por fecha de publicación"
            />
          </label>

          <label>
            Buscar:
            <input
              type="search"
              placeholder="Línea, palabra clave…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="notices__list">
        {filtered.map(n => (
          <Alert
            key={n.id}
            tone={n.severity}
            title={composeTitle(n)}
            action={
              n.url ? (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <a href={n.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <Boton texto="Más información" />
                  </a>
                </div>
              ) : null
            }
          >
            <>
              {n.description && <p style={{ margin: 0 }}>{n.description}</p>}
              {n.startsAt && (
                <p
                  style={{
                    margin: "0.25rem 0 0",
                    fontSize: ".9rem",
                    color: "var(--accent, #ff7a00)",
                    textAlign: "right",
                    fontWeight: 500
                  }}
                >
                  Publicado: {formatDateTime(n.startsAt)}
                </p>
              )}
            </>
          </Alert>
        ))}

        {filtered.length === 0 && (
          <p style={{ opacity: .8 }}>No hay avisos que coincidan con los filtros.</p>
        )}
      </div>
    </section>
  );
}

function composeTitle(n) {
  const parts = [];
  if (n.line) parts.push(`Línea ${n.line}`);
  parts.push(n.title);
  return parts.join(" — ");
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { dateStyle: "medium" }); // solo día
  } catch {
    return iso;
  }
}
