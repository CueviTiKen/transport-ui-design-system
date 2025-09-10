import { useEffect, useState } from "react";

/** Devuelve un valor que se actualiza pasado "delay" ms. */
export function useDebouncedValue(value, delay = 120) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
