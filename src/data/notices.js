// Muestras de avisos/incidencias para el sistema (puedes editar libremente)
const notices = [
  {
    id: "n-1",
    severity: "warning",
    line: "5",
    title: "Obras en Av. de la Paz",
    description: "Desvío provisional entre 09:00–13:00. Consulta las paradas alternativas señalizadas.",
    url: "https://example.com/obras-linea5",
    urlLabel: "Ver desvío y paradas",
    startsAt: "2025-09-07T08:00:00Z"
  },
  {
    id: "n-2",
    severity: "error",
    line: "12",
    title: "Incidencia: retrasos de hasta 15 min",
    description: "Congestión en acceso a Estación Intermodal. Recomendamos salir con antelación.",
    url: "https://example.com/incidencia-linea12",
    urlLabel: "Detalle de la incidencia",
    startsAt: "2025-09-07T07:30:00Z"
  },
  {
    id: "n-3",
    severity: "info",
    title: "Nueva parada en Villamediana",
    description: "Se añade parada ‘Avda. de la Rioja 14’ a partir del 10/09.",
    url: "https://example.com/nueva-parada",
    startsAt: "2025-09-06T16:00:00Z"
  },
  {
    id: "n-4",
    severity: "success",
    line: "3",
    title: "Servicio restablecido",
    description: "Finalizadas las tareas de mantenimiento. Horarios habituales.",
    url: "https://example.com/restablecido",
    startsAt: "2025-09-07T10:15:00Z"
  }
];

export default notices;
