import React, { useEffect, useMemo, useState } from "react";
import Field from "../ui/Field";
import TextInput from "../ui/TextInput";
import Checkbox from "../ui/Checkbox";
import ErrorSummary from "../patterns/ErrorSummary";
import TicketCard from "./TicketCard";
import { load, save, saveTicket } from "../../utils/storage";

const formatPrice = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
const toMinutes = (hhmm) => { const [h,m] = String(hhmm).split(":").map(Number); return h*60 + m; };
const addMinutesToTime = (hhmm, add) => {
  const total = toMinutes(hhmm) + add;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
};
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s));
const genGroupId = () => Math.random().toString(36).slice(2, 8).toUpperCase();

 /**
  * Checkout
  * Props:
  *  - planner: { origen,destino,dia,hora,tarifa,... }
  *  - tripMode: "oneway" | "round"
  *  - schedule: ida
  *  - returnSchedule?: vuelta (opcional)
  *  - seatOutbound: string|null
  *  - seatReturn?: string|null
  *  - onFinish?: (tickets[]) => void
  */
export default function Checkout({ planner, tripMode="oneway", schedule, returnSchedule=null, seatOutbound, seatReturn, onFinish }) {
  const [buyer, setBuyer] = useState({ nombre: "", email: "", acepta: false });
  const [errs, setErrs] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => { const mem = load("checkout.buyer", null); if (mem) setBuyer(mem); }, []);
  useEffect(() => { save("checkout.buyer", buyer); }, [buyer]);

  const arrivalIda = useMemo(() => addMinutesToTime(schedule.depart, schedule.durationMin), [schedule]);
  const arrivalVuelta = useMemo(
    () => returnSchedule ? addMinutesToTime(returnSchedule.depart, returnSchedule.durationMin) : null,
    [returnSchedule]
  );

  const total = (schedule?.price || 0) + (returnSchedule?.price || 0);

  const submit = (e) => {
    e.preventDefault();
    const newErrs = [];
    if (!buyer.nombre?.trim()) newErrs.push({ id: "nombre", message: "Introduce tu nombre" });
    if (!isEmail(buyer.email)) newErrs.push({ id: "email", message: "Introduce un email válido" });
    if (!buyer.acepta) newErrs.push({ id: "acepta", message: "Debes aceptar las condiciones de compra" });
    if (!seatOutbound) newErrs.push({ id: "seatOutbound", message: "Selecciona el asiento de IDA" });
    if (tripMode === "round" && returnSchedule && !seatReturn) newErrs.push({ id: "seatReturn", message: "Selecciona el asiento de VUELTA" });
    setErrs(newErrs);
    if (newErrs.length) return;

    const groupId = genGroupId();

    // Billete de ida
    const tOut = {
      locator: `T${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      groupId,
      leg: "outbound",
      buyer: { name: buyer.nombre, email: buyer.email },
      planner,
      schedule,
      seat: seatOutbound || null,
      total: schedule.price
    };
    saveTicket(tOut);

    let created = [tOut];

    // Billete de vuelta (si procede)
    if (tripMode === "round" && returnSchedule) {
      const tRet = {
        locator: `T${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        groupId,
        leg: "return",
        buyer: { name: buyer.nombre, email: buyer.email },
        planner,
        schedule: returnSchedule,
        seat: seatReturn || null,
        total: returnSchedule.price
      };
      saveTicket(tRet);
      created = [tOut, tRet];
    }

    setTickets(created);
    onFinish?.(created);
    setTimeout(()=>document.getElementById("ticket-card")?.focus(), 0);
  };

  return (
    <section aria-labelledby="checkout-title" className="checkout">
      <h2 id="checkout-title">Checkout</h2>

      <div className="card" aria-live="polite">
        <h3 style={{ marginTop: 0 }}>Resumen de compra</h3>
        <table className="table" style={{ marginTop: ".25rem" }}>
          <tbody>
            <tr><th scope="row">Tipo de viaje</th><td>{tripMode === "oneway" ? "Solo ida" : "Ida y vuelta (2 billetes)"}</td></tr>
            <tr><th scope="row">Origen</th><td>{planner.origen}</td></tr>
            <tr><th scope="row">Destino</th><td>{planner.destino}</td></tr>
            <tr><th scope="row">Fecha</th><td>{planner.dia || "—"} {planner.hora ? `a las ${planner.hora}` : ""}</td></tr>
            <tr><th scope="row">Tarifa</th><td>{planner.tarifa || "—"}</td></tr>
          </tbody>
        </table>

        <h4>Tramo de ida</h4>
        <table className="table" style={{ marginTop: ".25rem" }}>
          <tbody>
            <tr><th scope="row">Salida</th><td>{schedule.origin} • {schedule.depart}</td></tr>
            <tr><th scope="row">Llegada</th><td>{schedule.destination} • {arrivalIda}</td></tr>
            <tr><th scope="row">Duración</th><td>{schedule.durationMin} min</td></tr>
            <tr><th scope="row">Precio</th><td>{formatPrice(schedule.price)}</td></tr>
          </tbody>
        </table>

        {returnSchedule && (
          <>
            <h4>Tramo de vuelta</h4>
            <table className="table" style={{ marginTop: ".25rem" }}>
              <tbody>
                <tr><th scope="row">Salida</th><td>{returnSchedule.origin} • {returnSchedule.depart}</td></tr>
                <tr><th scope="row">Llegada</th><td>{returnSchedule.destination} • {arrivalVuelta}</td></tr>
                <tr><th scope="row">Duración</th><td>{returnSchedule.durationMin} min</td></tr>
                <tr><th scope="row">Precio</th><td>{formatPrice(returnSchedule.price)}</td></tr>
              </tbody>
            </table>
          </>
        )}

        <p><strong>Total a pagar: {formatPrice(total)}</strong></p>
      </div>

      <ErrorSummary errors={errs} />

      <form onSubmit={submit} noValidate>
        <Field label="Nombre y apellidos" id="nombre" error={errs.find(e=>e.id==="nombre")?.message}>
          <TextInput id="nombre" value={buyer.nombre} onChange={(e)=>setBuyer(b=>({...b, nombre: e.target.value}))} placeholder="María García" />
        </Field>

        <Field label="Email" id="email" error={errs.find(e=>e.id==="email")?.message} help="Recibirás los billetes y el localizador de cada uno.">
          <TextInput id="email" type="email" value={buyer.email} onChange={(e)=>setBuyer(b=>({...b, email: e.target.value}))} placeholder="maria@example.com" />
        </Field>

        {/* OJO: ya no creamos anclas ocultas. App asigna id="seatOutbound" y "seatReturn" en los SeatSelector para que ErrorSummary pueda enfocar directamente. */}

        <div className="field">
          <Checkbox id="acepta" label="Acepto las condiciones de compra" checked={buyer.acepta} onChange={(e)=>setBuyer(b=>({...b, acepta: e.target.checked}))} />
          {errs.find(e=>e.id==="acepta") && <div className="error" role="alert">Debes aceptar las condiciones de compra</div>}
        </div>

        <button type="submit" className="btn">Confirmar compra</button>
      </form>

      {/* Mostrar tickets emitidos de forma CLARA */}
      {tickets.length > 0 && (
        <div style={{ marginTop:"1rem" }}>
          <h3 style={{ marginTop:0 }}>Tus billetes</h3>
          <div style={{ display:"grid", gap:"1rem", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))" }}>
            {tickets.map((t, i)=>(
              <div key={t.locator}>
                <h4 style={{ margin:"0 0 .5rem" }}>{t.leg === "return" ? "Billete de vuelta" : "Billete de ida"}</h4>
                <TicketCard id={i===0 ? "ticket-card" : undefined} ticket={t} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
