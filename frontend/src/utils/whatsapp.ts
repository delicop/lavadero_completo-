const WA_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;

/** Normaliza el número al formato internacional para WhatsApp (Colombia: 57XXXXXXXXXX) */
function normalizarTelefono(telefono: string): string {
  const digits = telefono.replace(/\D/g, '');
  if (digits.startsWith('57') && digits.length >= 12) return digits; // ya tiene código de país
  if (digits.startsWith('0')) return `57${digits.slice(1)}`;         // quita el 0 inicial
  return `57${digits}`;
}

export interface DatosMensaje {
  nombreCliente: string;
  placa: string;
  marca: string;
  modelo: string;
  fechaHora?: string;   // requerido solo para turno creado
}

export function mensajeTurnoCreado(d: DatosMensaje): string {
  const fecha = d.fechaHora
    ? new Date(d.fechaHora).toLocaleString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long',
        hour: '2-digit', minute: '2-digit',
      })
    : '';
  return `Hola ${d.nombreCliente}! 👋 Tu vehículo *${d.placa}* (${d.marca} ${d.modelo}) quedó agendado para el ${fecha}. Te avisamos cuando esté listo. ¡Gracias!`;
}

export function mensajeTurnoCompletado(d: DatosMensaje): string {
  return `Hola ${d.nombreCliente}! ✅ Tu vehículo *${d.placa}* (${d.marca} ${d.modelo}) ya está listo para retirar. ¡Gracias por elegirnos! 🚗`;
}

/**
 * Muestra un toast en la esquina inferior derecha con un botón de WhatsApp.
 * Al hacer clic se abre wa.me con el mensaje pre-cargado.
 */
export function mostrarToastWhatsApp(telefono: string, mensaje: string, titulo: string): void {
  document.getElementById('wa-toast')?.remove();

  const numero = normalizarTelefono(telefono);
  const url    = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

  const toast = document.createElement('div');
  toast.id = 'wa-toast';
  toast.style.cssText = [
    'position:fixed', 'bottom:24px', 'right:24px',
    'background:white', 'border:1px solid var(--color-borde)',
    'border-radius:12px', 'padding:16px 20px',
    'box-shadow:0 4px 24px rgba(0,0,0,.15)',
    'display:flex', 'flex-direction:column', 'gap:12px',
    'z-index:9999', 'max-width:300px',
    'animation:wa-slidein .25s ease',
  ].join(';');

  toast.innerHTML = `
    <style>
      @keyframes wa-slidein {
        from { opacity:0; transform:translateY(12px); }
        to   { opacity:1; transform:translateY(0); }
      }
    </style>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span style="font-weight:700;font-size:0.9rem">${titulo}</span>
      <button id="wa-toast-close" style="background:none;border:none;cursor:pointer;font-size:1.3rem;line-height:1;color:var(--color-texto-suave);padding:0">×</button>
    </div>
    <a href="${url}" target="_blank" rel="noopener"
       style="display:flex;align-items:center;gap:8px;background:#25d366;color:white;
              padding:10px 14px;border-radius:8px;text-decoration:none;
              font-weight:700;font-size:0.9rem;justify-content:center">
      ${WA_ICON}
      Enviar WhatsApp
    </a>
    <p style="font-size:0.75rem;color:var(--color-texto-suave);margin:0;line-height:1.4">${mensaje.slice(0, 80)}…</p>
  `;

  document.body.appendChild(toast);

  document.getElementById('wa-toast-close')?.addEventListener('click', () => toast.remove());
  setTimeout(() => toast.remove(), 20_000);
}
