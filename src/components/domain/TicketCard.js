import React from "react";

export default function TicketCard({ ticket, id }) {
  const { locator, buyer, planner, schedule, seat, total, status, leg } = ticket;
  return (
    <article id={id} tabIndex={-1} className="card" aria-label={`Ticket ${locator}`}>
      <h3 style={{ marginTop: 0 }}>Billete {leg === "return" ? "de vuelta" : "de ida"}</h3>
      <p style={{ marginTop: 0 }}>
        Localizador: <strong>{locator}</strong> {status && <em style={{ opacity:.8 }}>({labelStatus(status)})</em>}
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 .5rem" }}>
        <li><strong>Pasajero:</strong> {buyer.nombre} — <strong>Email:</strong> {buyer.email}</li>
        <li><strong>Ruta:</strong> {planner.origen} → {planner.destino}</li>
        <li><strong>Fecha:</strong> {planner.dia || "—"} {planner.hora ? `a las ${planner.hora}` : ""}</li>
        <li><strong>Línea:</strong> #{schedule.line}</li>
        <li><strong>Salida:</strong> {schedule.depart} · <strong>Llegada:</strong> {addMinutesToTime(schedule.depart, schedule.durationMin)}</li>
        <li><strong>Asiento:</strong> {seat || "—"}</li>
        <li><strong>Precio:</strong> {formatPrice(total)}</li>
      </ul>

      <div style={{ display:"flex", gap:".5rem", flexWrap:"wrap", marginTop:".5rem" }}>
        <button type="button" className="btn" onClick={() => window.print()}>Imprimir</button>
        <button type="button" className="btn" onClick={() => navigator.clipboard?.writeText(locator)}>Copiar localizador</button>
      </div>
    </article>
  );
}

function labelStatus(s){ return s === "cancelled" ? "anulado" : s === "confirmed" ? "confirmado" : s; }
function formatPrice(n) { return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n); }
function toMinutes(hhmm) { const [h, m] = String(hhmm).split(":").map(Number); return h * 60 + m; }
function addMinutesToTime(hhmm, add) { const total = toMinutes(hhmm) + add; const h = Math.floor(total / 60) % 24; const m = total % 60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }
