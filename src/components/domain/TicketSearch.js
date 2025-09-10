import React, { useMemo, useState } from "react";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import ErrorSummary from "../patterns/ErrorSummary";
import TicketCard from "./TicketCard";
import ConfirmDialog from "../patterns/ConfirmDialog";
import { findTickets, updateTicket } from "../../utils/storage";

const formatPrice = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
const arrivalOf = (t) => {
  const [h, m] = String(t.schedule.depart).split(":").map(Number);
  const total = h*60 + m + Number(t.schedule.durationMin || 0);
  const hh = String(Math.floor(total/60)%24).padStart(2,"0");
  const mm = String(total%60).padStart(2,"0");
  return `${hh}:${mm}`;
};
const isEmail = (s) => !s || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

export default function TicketSearch(){
  const [q, setQ] = useState({ locator:"", email:"" });
  const [errs, setErrs] = useState([]);
  const [results, setResults] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [confirm, setConfirm] = useState({ open:false, locator:null });
  const [edit, setEdit] = useState({ locator:null, seat:"" });

  const handleSearch = (e)=>{
    e?.preventDefault?.();
    const es = [];
    if (!q.locator && !q.email) es.push({ id:"q", message: "Introduce localizador y/o email" });
    if (q.email && !isEmail(q.email)) es.push({ id:"email", message: "Email no válido" });
    setErrs(es);
    if (es.length) return;
    const found = findTickets({ locator: q.locator, email: q.email });
    setResults(found);
    setExpanded(null);
    setEdit({ locator:null, seat:"" });
  };

  const header = useMemo(()=>(
    <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap" }}>
      <h2 style={{ margin:0 }}>Gestión de billete</h2>
      {!!results.length && <div style={{ opacity:.8 }}>{results.length} resultado{results.length!==1?"s":""}</div>}
    </div>
  ),[results.length]);

  const download = (t) => {
    const blob = new Blob([JSON.stringify(t, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ticket-${t.locator}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const requestCancel = (locator) => setConfirm({ open:true, locator });
  const confirmCancel = () => {
    const loc = confirm.locator;
    updateTicket(loc, (prev)=> ({ ...prev, status:"cancelled" }));
    setConfirm({ open:false, locator:null });
    handleSearch();
  };

  const startEditSeat = (t) => setEdit({ locator: t.locator, seat: t.seat || "" });
  const saveEditSeat = (t) => {
    if (!edit.seat?.trim()) return alert("Introduce un asiento, por ejemplo A1");
    updateTicket(t.locator, (prev) => ({ ...prev, seat: edit.seat.trim() }));
    setEdit({ locator:null, seat:"" });
    handleSearch();
  };

  return (
    <section aria-labelledby="manage-title" style={{ marginTop:"2rem" }}>
      <div className="card">
        {header}

        <ErrorSummary errors={errs} />

        <form onSubmit={handleSearch} noValidate>
          <Field label="Localizador" id="locator">
            <TextInput id="locator" value={q.locator} onChange={(e)=>setQ(s=>({...s, locator:e.target.value}))} placeholder="ABC123" />
          </Field>

          <Field label="Email" id="email" help="El usado en la compra." error={errs.find(e=>e.id==="email")?.message}>
            <TextInput id="email" type="email" value={q.email} onChange={(e)=>setQ(s=>({...s, email:e.target.value}))} placeholder="persona@example.com" />
          </Field>

          <button type="submit" className="btn">Buscar</button>
        </form>
      </div>

      {!!results.length && (
        <div className="card" style={{ marginTop:"1rem" }}>
          <h3 style={{ marginTop:0 }}>Resultados</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Localizador</th>
                <th>Tipo</th>
                <th>Pasajero</th>
                <th>Ruta</th>
                <th>Fecha</th>
                <th>Salida</th>
                <th>Llegada</th>
                <th>Asiento</th>
                <th>Total</th>
                <th>Estado</th>
                <th className="visually-hidden">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {results.map(t => (
                <tr key={t.locator}>
                  <td>{t.locator}</td>
                  <td>{t.leg === "return" ? "Vuelta" : "Ida"}</td>
                  <td>{t.buyer?.nombre || "—"}</td>
                  <td>{t.planner?.origen} → {t.planner?.destino}</td>
                  <td>{t.planner?.dia || "—"}</td>
                  <td>{t.schedule?.depart}</td>
                  <td>{arrivalOf(t)}</td>
                  <td>
                    {edit.locator === t.locator ? (
                      <span style={{ display:"inline-flex", gap:".25rem" }}>
                        <input
                          className="time-input__text"
                          value={edit.seat}
                          onChange={(e)=>setEdit(s=>({...s, seat:e.target.value}))}
                          placeholder="A1"
                          style={{ width:90 }}
                        />
                        <button type="button" className="btn" onClick={()=>saveEditSeat(t)}>Guardar</button>
                        <button type="button" className="btn" onClick={()=>setEdit({ locator:null, seat:"" })}>Cancelar</button>
                      </span>
                    ) : (
                      t.seat || "—"
                    )}
                  </td>
                  <td>{formatPrice(t.total || t.schedule?.price || 0)}</td>
                  <td>{t.status === "cancelled" ? "Anulado" : "Válido"}</td>
                  <td>
                    <div style={{ display:"flex", gap:".25rem", flexWrap:"wrap" }}>
                      <button type="button" className="btn" onClick={()=>setExpanded(p=>p===t.locator?null:t.locator)}>
                        {expanded === t.locator ? "Ocultar" : "Ver"}
                      </button>
                      <button type="button" className="btn" onClick={()=>download(t)}>Descargar</button>
                      {t.status !== "cancelled" && (
                        <>
                          <button type="button" className="btn" onClick={()=>startEditSeat(t)}>Modificar asiento</button>
                          <button type="button" className="btn" onClick={()=>requestCancel(t.locator)}>Anular</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {results.map(t => (
            expanded === t.locator ? (
              <div key={t.locator} style={{ marginTop:"1rem" }}>
                <TicketCard ticket={t} />
              </div>
            ) : null
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Confirmar anulación"
        description="¿Seguro que deseas anular este billete? Esta acción no se puede deshacer."
        confirmLabel="Anular billete"
        onCancel={()=>setConfirm({ open:false, locator:null })}
        onConfirm={confirmCancel}
      />
    </section>
  );
}
