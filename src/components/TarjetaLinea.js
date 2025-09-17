import React from "react";

/**
 * TarjetaLinea
 * - numero:   string|number  (p.ej. "0")
 * - destino:  string         (p.ej. "Logroño")
 * - salida:   string         (p.ej. "00:00h")
 * - llegada:  string         (p.ej. "00:00h")
 * - onPrev?:  () => void     (para slider: ir a línea anterior)
 * - onNext?:  () => void     (para slider: ir a línea siguiente)
 */
export default function TarjetaLinea({
  numero,
  destino,
  salida = "00:00h",
  llegada = "00:00h",
  onPrev,
  onNext,
}) {
  return (
    <article className="linecard" aria-labelledby={`linea-${numero}`}>
      <header className="linecard__header">
        {onPrev && (
          <button
            type="button"
            className="linecard__nav linecard__nav--prev"
            aria-label="Línea anterior"
            onClick={onPrev}
          >
            ‹
          </button>
        )}
        <h2 id={`linea-${numero}`} className="linecard__title">
          Línea {numero}
        </h2>
        {onNext && (
          <button
            type="button"
            className="linecard__nav linecard__nav--next"
            aria-label="Siguiente línea"
            onClick={onNext}
          >
            ›
          </button>
        )}
      </header>

      <div className="linecard__body">
        <div className="linecard__row">
          <span className="linecard__label">Destino</span>
          <span className="linecard__value">{destino}</span>
        </div>
        <div className="linecard__row">
          <span className="linecard__label">Salida</span>
          <span className="linecard__value">
            <time>{salida}</time>
          </span>
        </div>
        <div className="linecard__row">
          <span className="linecard__label">Llegada</span>
          <span className="linecard__value">
            <time>{llegada}</time>
          </span>
        </div>
      </div>
    </article>
  );
}
