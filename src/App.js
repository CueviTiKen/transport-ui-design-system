import React, { useEffect, useMemo, useState } from "react";
import Boton from "./components/Boton";
import TarjetaLinea from "./components/TarjetaLinea";
import Field from "./components/ui/Field";
import TextInput from "./components/ui/TextInput";
import Select from "./components/ui/Select";
import Checkbox from "./components/ui/Checkbox";
import ErrorSummary from "./components/patterns/ErrorSummary";
import Combobox from "./components/ui/Combobox";
import DateInput from "./components/ui/DateInput";
import TimeInput from "./components/ui/TimeInput";
import Dialog from "./components/ui/Dialog";
import ScheduleList from "./components/domain/ScheduleList";
import SeatSelector from "./components/domain/SeatSelector";
import Notices from "./components/domain/Notices";
import Checkout from "./components/domain/Checkout";
import TicketSearch from "./components/domain/TicketSearch";
import TarifaSelect from "./components/ui/TarifaSelect";

import stops from "./data/stops";
import schedules from "./data/schedules";
import seatConfig from "./data/seats";
import notices from "./data/notices";

import './styles/tokens.css';
import './styles/App.css';

export default function App(){
  const [theme, setTheme] = useState("light");
  useEffect(()=>{ document.documentElement.setAttribute("data-theme", theme === "light" ? "" : theme); },[theme]);

  const [form, setForm] = useState({ origen:"", destino:"", dia:"", hora:"", acepta:false, tarifa:"" });
  const [errs, setErrs] = useState([]);
  const [showDlg, setShowDlg] = useState(false);

  // Flujo ida / vuelta
  const [selectedOutbound, setSelectedOutbound] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [tripMode, setTripMode] = useState("round"); // "round" | "oneway"

  // Asientos por tramo
  const [seatOutbound, setSeatOutbound] = useState(null);
  const [seatReturn, setSeatReturn] = useState(null);

  // Helpers para normalizar ciudad desde Combobox ("Ciudad - Parada")
  const cityFromStop = (s) => (s || "").split(" - ")[0].trim();
  const matches = (val, q) => !q || cityFromStop(q).toLowerCase() === String(val || "").toLowerCase();

  // Candidatos de vuelta: ruta inversa (ejemplo)
  const returnCandidates = useMemo(()=>{
    if(!form.origen || !form.destino) return [];
    return schedules.filter(s => matches(s.origin, form.destino) && matches(s.destination, form.origen));
  },[form.origen, form.destino]);

  const submit = (e)=>{
    e.preventDefault();
    const newErrs = [];
    if(!form.origen)  newErrs.push({ id:"origen",  message:"Introduce un origen" });
    if(!form.destino) newErrs.push({ id:"destino", message:"Introduce un destino" });
    if(!form.dia)     newErrs.push({ id:"dia",     message:"Introduce una fecha" });
    if(!form.hora)    newErrs.push({ id:"hora",    message:"Introduce una hora" });
    if(!form.acepta)  newErrs.push({ id:"acepta",  message:"Debes aceptar las condiciones" });
    setErrs(newErrs);
    if(newErrs.length) return;

    // Nueva búsqueda → resetea selección y asientos
    setSelectedOutbound(null);
    setSelectedReturn(null);
    setTripMode("round");
    setSeatOutbound(null);
    setSeatReturn(null);
  };

  return (
    <div className="container App">
      <h1>Sistema de diseño para transporte público</h1>

      {/* Conmutador de temas y diálogo de condiciones */}
      <div className="theme-switcher" style={{ display:"flex", gap:".5rem", margin:"1rem 0" }}>
        <button className="btn" type="button" onClick={()=>setTheme("light")}>Claro</button>
        <button className="btn" type="button" onClick={()=>setTheme("dark")}>Oscuro</button>
        <button className="btn" type="button" onClick={()=>setTheme("hc")}>Alto contraste</button>
        <button className="btn" type="button" onClick={()=>setShowDlg(true)}>Ver condiciones</button>
      </div>

      <ErrorSummary errors={errs} />

      {/* Formulario del planificador */}
      <form onSubmit={submit} noValidate>
        <Field
          label="Origen"
          help="Escribe una parada (ej. 'Logroño') y usa flechas para moverte por los resultados."
          error={errs.find(e=>e.id==="origen")?.message}
          id="origen"
        >
          <Combobox
            highlightOnOpen
            value={form.origen}
            onChange={(val)=>setForm(f=>({...f, origen:val}))}
            options={stops}
            placeholder="Busca origen…"
          />
        </Field>

        <Field
          label="Destino"
          help="Navega con flechas, Enter para seleccionar, Esc para cerrar."
          error={errs.find(e=>e.id==="destino")?.message}
          id="destino"
        >
          <Combobox
            highlightOnOpen
            value={form.destino}
            onChange={(val)=>setForm(f=>({...f, destino:val}))}
            options={stops}
            placeholder="Busca destino…"
          />
        </Field>

        <Field label="Fecha del viaje" help="Pulsa 📅 o Alt+↓/Enter para abrir el calendario (dd/mm/aaaa)." error={errs.find(e=>e.id==="dia")?.message} id="dia">
          <DateInput value={form.dia} onChange={(v)=>setForm(f=>({...f, dia:v}))} placeholder="dd/mm/aaaa" />
        </Field>

        <Field label="Hora del viaje" help="Formato 24 h HH:MM. Usa ↑/↓ para ajustar (Shift para horas)." error={errs.find(e=>e.id==="hora")?.message} id="hora">
          <TimeInput value={form.hora} onChange={(v)=>setForm(f=>({...f, hora:v}))} placeholder="12:30" step={5} />
        </Field>

        <Field label="Tarifa" help="Selecciona un tipo de billete">
          <TarifaSelect
            value={form.tarifa}
            onChange={val => setForm(f => ({ ...f, tarifa: val }))}
          />
        </Field>

        <div className="field">
          <Checkbox id="acepta" label="Acepto las condiciones" checked={form.acepta} onChange={e=>setForm(f=>({...f, acepta:e.target.checked}))} />
          {errs.find(e=>e.id==="acepta") && (<div className="error" role="alert">Debes aceptar las condiciones</div>)}
        </div>

        <div>
          <Boton texto="Buscar" />
          <div className="separador-buscar-linea-vertical"></div>
          {/* ...otras tarjetas si las tienes... */}
        </div>
      </form>

      {/* Tarjetas de ejemplo */}
      <div>
      <TarjetaLinea numero="5" destino="Centro" hora="10:30" />
      <TarjetaLinea numero="12" destino="Estación" hora="11:00" />
      </div>

      {/* 1) Selección de IDA */}
      <h2 style={{ marginTop: "2rem" }}>Elige tu IDA</h2>
      <ScheduleList
        items={schedules.filter(s => matches(s.origin, form.origen) && matches(s.destination, form.destino))}
        onSelect={(it) => { setSelectedOutbound(it); setTripMode("round"); }}
      />

      {/* 2) Si hay ida elegida y seguimos en ida/vuelta, pedir VUELTA */}
      {selectedOutbound && tripMode==="round" && !selectedReturn && (
        <section style={{ marginTop:"1.5rem" }}>
          <div style={{ display:"flex", gap:".5rem", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap" }}>
            <h2 style={{ margin:0 }}>Elige tu VUELTA</h2>
            <button type="button" className="btn" onClick={()=>setTripMode("oneway")}>Sólo quiero ida</button>
          </div>
          <ScheduleList
            items={returnCandidates}
            onSelect={(it)=> setSelectedReturn(it)}
          />
          {returnCandidates.length===0 && (
            <p style={{ opacity:.8 }}>No hay horarios de vuelta para {form.destino} → {form.origen} en la lista de ejemplo.</p>
          )}
        </section>
      )}

      {/* 3) Selector de asientos (uno por tramo) */}
      <h2 style={{ marginTop: "2rem" }}>Selecciona tus asientos</h2>

      <h3 style={{ margin: "0 0 .5rem" }}>Asiento de IDA</h3>
      <SeatSelector
        id="seatOutbound"
        rows={seatConfig.rows} cols={seatConfig.cols} aisleAfter={seatConfig.aisleAfter}
        occupied={seatConfig.occupied} reserved={seatConfig.reserved}
        value={seatOutbound} onChange={setSeatOutbound}
      />
      {seatOutbound && <p style={{ marginTop: ".5rem" }}>Asiento de ida: <strong>{seatOutbound}</strong></p>}

      {selectedOutbound && tripMode==="round" && selectedReturn && (
        <>
          <h3 style={{ margin: "1rem 0 .5rem" }}>Asiento de VUELTA</h3>
          <SeatSelector
            id="seatReturn"
            rows={seatConfig.rows} cols={seatConfig.cols} aisleAfter={seatConfig.aisleAfter}
            occupied={seatConfig.occupied} reserved={seatConfig.reserved}
            value={seatReturn} onChange={setSeatReturn}
          />
          {seatReturn && <p style={{ marginTop: ".5rem" }}>Asiento de vuelta: <strong>{seatReturn}</strong></p>}
        </>
      )}

      {/* 4) Checkout: aparece si es SOLO IDA o si ya eligió vuelta */}
      {(selectedOutbound && (tripMode==="oneway" || selectedReturn)) && (
        <div style={{ marginTop:"2rem" }}>
          <Checkout
            planner={form}
            tripMode={tripMode}
            schedule={selectedOutbound}
            returnSchedule={tripMode==="round" ? selectedReturn : null}
            seatOutbound={seatOutbound}
            seatReturn={tripMode==="round" ? seatReturn : null}
            onFinish={(t)=>console.log("Tickets emitidos:", t)}
          />
        </div>
      )}

      {/* Avisos e incidencias */}
      <Notices items={notices} />

      {/* Gestión de billete */}
      <TicketSearch />

      {/* Dialog accesible */}
      <Dialog open={showDlg} onClose={()=>setShowDlg(false)} title="Condiciones de uso">
        <p>Ejemplo de diálogo accesible con <strong>focus trap</strong>, cierre con <kbd>Esc</kbd> y click en fondo.</p>
        <div style={{ display:"flex", gap:".5rem", marginTop:"1rem" }}>
          <button className="btn" type="button" onClick={()=>setShowDlg(false)}>Aceptar</button>
          <button className="btn" type="button" onClick={()=>setShowDlg(false)}>Cerrar</button>
        </div>
      </Dialog>
    </div>
  );
}
