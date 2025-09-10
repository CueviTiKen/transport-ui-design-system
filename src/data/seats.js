// Configuración de ejemplo para un bus 2+2 con pasillo central.
// 10 filas (A..J), 4 asientos por fila, pasillo tras la columna 2.
const seatConfig = {
  rows: 10,
  cols: 4,
  aisleAfter: 2,
  // Muestras de ocupados/reservados para evidencias (WCAG + estados)
  occupied: ["A1", "A2", "C3", "D4", "F2", "H1"],
  reserved: ["B4", "E1", "G3"]
};

export default seatConfig;
