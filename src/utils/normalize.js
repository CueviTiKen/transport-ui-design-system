export function normalizeStr(s = "") {
  return String(s)
    .normalize("NFD")              // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // quita diacríticos
    .toLowerCase()
    .trim();
}