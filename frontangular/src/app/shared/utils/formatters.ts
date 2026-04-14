export function formatFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrecio(precio: number, moneda = 'COP'): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 0,
  }).format(precio);
}

export function calcularPeriodo(dias: number): { fechaDesde: string; fechaHasta: string } {
  const hoy = new Date();
  const desde = new Date();
  desde.setDate(hoy.getDate() - dias + 1);
  return { fechaDesde: fechaLocal(desde), fechaHasta: fechaLocal(hoy) };
}

/** Devuelve la fecha local (YYYY-MM-DD) sin conversión UTC — evita salto de día en Colombia */
export function fechaLocal(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Primer día del mes actual en fecha local */
export function primerDiaMesLocal(): string {
  const hoy = new Date();
  return fechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
}
