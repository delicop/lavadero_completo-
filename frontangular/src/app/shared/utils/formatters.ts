export function formatFecha(fechaIso: string): string {
  return new Date(fechaIso).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrecio(precio: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precio);
}

export function calcularPeriodo(dias: number): { fechaDesde: string; fechaHasta: string } {
  const hoy = new Date();
  const desde = new Date();
  desde.setDate(hoy.getDate() - dias + 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { fechaDesde: fmt(desde), fechaHasta: fmt(hoy) };
}
