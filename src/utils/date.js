// Utilidades simples de fecha (sin librerías externas)
// Formato: dd/mm/aaaa; semana empieza en lunes

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatDMY(d) {
  if (!(d instanceof Date) || isNaN(d)) return "";
  const dd = pad2(d.getDate());
  const mm = pad2(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function parseDMY(str) {
  if (!str) return null;
  const m = String(str).trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) return null;
  const dd = +m[1], mm = +m[2], yyyy = +m[3];
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const d = new Date(yyyy, mm - 1, dd);
  // Comprueba overflow (p. ej., 31/02)
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return d;
}

export function startOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addMonths(d, delta) {
  const x = new Date(d.getFullYear(), d.getMonth() + delta, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function dayToMondayIndex(jsDay) {
  // jsDay: 0=dom,1=lun,...6=sab → queremos 0=lun,...6=dom
  return (jsDay + 6) % 7;
}

export function startOfCalendarGrid(monthDate) {
  // Primer día visible (lunes) de la rejilla del mes
  const first = startOfMonth(monthDate);
  const di = dayToMondayIndex(first.getDay());
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - di);
  return gridStart;
}

export function buildCalendar(monthDate) {
  // Devuelve 6 semanas x 7 días = 42 celdas
  const start = startOfCalendarGrid(monthDate);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function clampToMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
