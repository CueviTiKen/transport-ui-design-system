import React from "react";

export default function TarjetaLinea({ numero, destino, hora }) {
  return (
    <article className="card" aria-labelledby={`linea-${numero}`}>
      <h2 id={`linea-${numero}`} style={{ margin: 0 }}>
        Línea {numero}
      </h2>
      <p style={{ margin: "0.25rem 0" }}>
        <strong>Destino:</strong> {destino}
      </p>
      <p style={{ margin: 0 }}>
        <strong>Hora de salida: </strong>
        <time dateTime={`${hora}:00`}>{hora}</time>
      </p>
    </article>
  );
}
