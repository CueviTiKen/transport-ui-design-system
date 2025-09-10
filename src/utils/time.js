// Utilidades de hora (24h) sin libs

export function parseHHMM(str) {
  if (!str) return null;
  const m = String(str).trim().match(/^(\d{1,2}):?(\d{2})$/);
  if (!m) return null;
  let h = Number(m[1]);
  let mi = Number(m[2]);
  if (!Number.isInteger(h) || !Number.isInteger(mi)) return null;
  if (h < 0 || h > 23 || mi < 0 || mi > 59) return null;
  return { h, m: mi };
}

export function formatHHMM(h, m) {
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function addMinutes(h, m, delta) {
  // suma delta minutos y devuelve [h, m] normalizados a 0..23:0..59
  let total = h * 60 + m + delta;
  // wrap dentro de 0..1439
  total = ((total % 1440) + 1440) % 1440;
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return [nh, nm];
}
