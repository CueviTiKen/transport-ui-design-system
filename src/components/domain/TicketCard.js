import React, { useMemo, useState } from "react";
import Dialog from "../ui/Dialog";

export default function TicketCard({ id, ticket }) {
  // Hooks SIEMPRE al tope (nunca detrás de returns)
  const [open, setOpen] = useState(false);

  // Desestructuración segura aunque ticket sea null
  const schedule   = ticket?.schedule ?? null;
  const seat       = ticket?.seat ?? null;
  const locator    = ticket?.locator ?? "—";
  const groupId    = ticket?.groupId ?? null;
  const buyer      = ticket?.buyer ?? null;
  const planner    = ticket?.planner ?? null;
  const leg        = ticket?.leg ?? "outbound";

  const origin      = schedule?.origin ?? "—";
  const destination = schedule?.destination ?? "—";
  const depart      = schedule?.depart ?? "00:00";
  const arrive = useMemo(
    () => (schedule ? addMinutesToTime(schedule.depart, schedule.durationMin) : "00:00"),
    [schedule]
  );

  const titleId = `${id || locator || "ticket"}-title`;

  // Ahora ya podemos salir si no hay ticket, sin romper reglas de hooks
  if (!ticket) return null;

  return (
    <>
      <article id={id} className="ticket" tabIndex={-1} aria-labelledby={titleId}>
        <header className="ticket__header">
          <h3 id={titleId} className="ticket__title">Billete — Autobuses Jiménez</h3>
        </header>

        <div className="ticket__body">
          <h4 className="ticket__route">{origin} — {destination}</h4>

          <div className="ticket__info">
            <p><strong>Salida:</strong> {depart}h — {origin}</p>
            <p><strong>Llegada:</strong> {arrive}h — {destination}</p>
            {seat && <p><strong>Asiento:</strong> {seat}</p>}
          </div>

          <footer className="ticket__footer">
            <small className="ticket__code">Código de seguimiento: {locator}</small>
            <button type="button" className="btn ticket__cta" onClick={() => setOpen(true)}>
              Más información
            </button>
          </footer>
        </div>
      </article>

      <Dialog open={open} onClose={() => setOpen(false)} title="Detalles del billete">
        <h4 style={{ marginTop: 0, color: "var(--accent)" }}>
          {origin} — {destination}
        </h4>

        <table className="table" style={{ marginTop: ".5rem" }}>
          <tbody>
            <tr><th scope="row">Línea</th><td>#{schedule?.line ?? "—"}</td></tr>
            <tr><th scope="row">Salida</th><td>{origin} • {depart}h</td></tr>
            <tr><th scope="row">Llegada</th><td>{destination} • {arrive}h</td></tr>
            <tr><th scope="row">Duración</th><td>{formatDuration(schedule?.durationMin ?? 0)}</td></tr>
            <tr><th scope="row">Ocupación</th><td>{occupancyLabel(schedule?.occupancy)}</td></tr>
            <tr><th scope="row">Asiento</th><td>{seat || "—"}</td></tr>
            <tr><th scope="row">Precio</th><td className="precio">{formatPrice(schedule?.price ?? 0)}</td></tr>
            <tr><th scope="row">Localizador</th><td>{locator}</td></tr>
            {groupId && <tr><th scope="row">Grupo de reserva</th><td>{groupId}</td></tr>}
            {buyer && (
              <>
                <tr><th scope="row">Comprador</th><td>{buyer.nombre || "—"}</td></tr>
                <tr><th scope="row">Email</th><td>{buyer.email || "—"}</td></tr>
              </>
            )}
            {planner && (
              <>
                <tr><th scope="row">Fecha del viaje</th><td>{planner.dia || "—"} {planner.hora ? `a las ${planner.hora}` : ""}</td></tr>
                <tr><th scope="row">Tarifa</th><td>{planner.tarifa || "—"}</td></tr>
              </>
            )}
            <tr><th scope="row">Tramo</th><td>{leg === "return" ? "Vuelta" : "Ida"}</td></tr>
          </tbody>
        </table>

        <div style={{ display: "flex", gap: ".5rem", marginTop: "1rem" }}>
          <button className="btn" type="button" onClick={() => setOpen(false)}>Cerrar</button>
        </div>
      </Dialog>
    </>
  );
}

/* ===== Utils ===== */
function toMinutes(hhmm) { const [h, m] = String(hhmm).split(":").map(Number); return h * 60 + m; }
function addMinutesToTime(hhmm, add) {
  const total = toMinutes(hhmm) + add;
  const h = Math.floor(total / 60) % 24, m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function formatDuration(mins) {
  const h = Math.floor((mins || 0) / 60), m = (mins || 0) % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}
function formatPrice(n) { return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n || 0); }
function occupancyLabel(lvl) {
  switch (lvl) {
    case "low": return "Ocupación baja";
    case "medium": return "Ocupación media";
    case "high": return "Ocupación alta";
    default: return "—";
  }
}
