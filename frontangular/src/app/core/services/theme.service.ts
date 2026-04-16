import { Injectable } from '@angular/core';

export interface TemaConfig {
  colorPrimario?: string | null;
  colorSidebar?: string | null;
  colorFondo?: string | null;
  colorSuperficie?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {

  aplicar(config: TemaConfig): void {
    const root = document.documentElement;

    // ── Color primario (botones, links activos, acciones) ──────────────
    const primary = config.colorPrimario || '#2563eb';
    root.style.setProperty('--color-primario', primary);
    root.style.setProperty('--color-primario-hover', this.oscurecer(primary, 15));

    // ── Sidebar ────────────────────────────────────────────────────────
    const sidebarBg = config.colorSidebar || '#ffffff';
    root.style.setProperty('--sidebar-bg', sidebarBg);

    const oscuro = this.esOscuro(sidebarBg);
    if (oscuro) {
      root.style.setProperty('--sidebar-texto',       '#94a3b8');
      root.style.setProperty('--sidebar-texto-fuerte', '#f1f5f9');
      root.style.setProperty('--sidebar-hover-bg',    'rgba(255,255,255,0.08)');
      root.style.setProperty('--sidebar-activo-bg',   'rgba(255,255,255,0.14)');
      root.style.setProperty('--sidebar-borde',       'rgba(255,255,255,0.1)');
    } else {
      root.style.setProperty('--sidebar-texto',        '#64748b');
      root.style.setProperty('--sidebar-texto-fuerte', '#0f172a');
      root.style.setProperty('--sidebar-hover-bg',     '#f8fafc');
      root.style.setProperty('--sidebar-activo-bg',    this.tintar(primary));
      root.style.setProperty('--sidebar-borde',        '#e2e8f0');
    }

    // ── Fondo del contenido ────────────────────────────────────────────
    const fondo = config.colorFondo || '#f8fafc';
    root.style.setProperty('--color-fondo', fondo);

    // ── Superficie (cards, inputs, modales) ────────────────────────────
    const superficie = config.colorSuperficie || '#ffffff';
    root.style.setProperty('--color-superficie', superficie);
  }

  // ── Helpers ────────────────────────────────────────────────────────

  /** Oscurece un color hex en `n` puntos por canal */
  private oscurecer(hex: string, n: number): string {
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - n);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - n);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - n);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /** Genera un tinte muy claro del color primario (para fondo activo del sidebar claro) */
  private tintar(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const tr = Math.round(r * 0.12 + 255 * 0.88);
    const tg = Math.round(g * 0.12 + 255 * 0.88);
    const tb = Math.round(b * 0.12 + 255 * 0.88);
    return `#${tr.toString(16).padStart(2, '0')}${tg.toString(16).padStart(2, '0')}${tb.toString(16).padStart(2, '0')}`;
  }

  /** Devuelve true si el color es oscuro (luminancia relativa < 0.5) */
  private esOscuro(hex: string): boolean {
    if (!hex.startsWith('#') || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Luminancia percibida (fórmula WCAG)
    const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminancia < 0.5;
  }
}
