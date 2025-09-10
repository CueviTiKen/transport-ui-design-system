// Persistencia simple en localStorage
export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
export function load(key, fallback = null) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

/** Tickets */
const TICKETS_KEY = "tickets";

/** Devuelve todos los tickets (array) */
export function getTickets() {
  return load(TICKETS_KEY, []);
}

/** Inserta o actualiza un ticket por localizador */
export function saveTicket(t) {
  const list = getTickets();
  const idx = list.findIndex(x => x.locator === t.locator);
  if (idx >= 0) list[idx] = t; else list.push(t);
  save(TICKETS_KEY, list);
  // guardamos además “último” para accesos rápidos si lo necesitas
  save("checkout.lastTicket", t);
}

/** Busca tickets por localizador y/o email (coincidencia exacta, case-insensitive en email) */
export function findTickets({ locator, email }) {
  const list = getTickets();
  const loc = (locator || "").trim().toUpperCase();
  const eml = (email || "").trim().toLowerCase();
  return list.filter(t => {
    const okL = loc ? String(t.locator).toUpperCase() === loc : true;
    const okE = eml ? String(t.buyer?.email || "").toLowerCase() === eml : true;
    return okL && okE;
  });
}

/** Actualiza un ticket por localizador. Devuelve el actualizado o null. */
export function updateTicket(locator, updater) {
  const list = getTickets();
  const idx = list.findIndex(t => t.locator === locator);
  if (idx < 0) return null;
  const prev = list[idx];
  const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
  list[idx] = next;
  save(TICKETS_KEY, list);
  return next;
}
