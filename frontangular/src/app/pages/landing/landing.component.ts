import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styles: [`
    :host { display: block; }

    /* ── Nav ─────────────────────────────────── */
    .nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 48px; height: 64px;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e2e8f0;
    }
    .nav-marca {
      display: flex; align-items: center; gap: 10px;
      font-size: 1.1rem; font-weight: 800; color: #0f172a;
      letter-spacing: -0.03em; text-decoration: none;
    }
    .nav-marca-icono {
      width: 34px; height: 34px; border-radius: 9px;
      background: #2563eb; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 17px;
    }
    .nav-acciones { display: flex; align-items: center; gap: 10px; }
    .nav-link {
      padding: 7px 16px; border-radius: 7px; font-size: 0.875rem;
      font-weight: 500; cursor: pointer; text-decoration: none;
      color: #64748b; transition: color 0.15s, background 0.15s;
    }
    .nav-link:hover { color: #0f172a; background: #f1f5f9; }
    .nav-cta {
      background: #2563eb; color: white; padding: 8px 18px;
      border-radius: 7px; font-size: 0.875rem; font-weight: 600;
      text-decoration: none; transition: background 0.15s;
    }
    .nav-cta:hover { background: #1d4ed8; }

    /* ── Hero ────────────────────────────────── */
    .hero {
      background: linear-gradient(150deg, #eff6ff 0%, #f8fafc 50%, #f0fdf4 100%);
      padding: 96px 48px 80px;
      text-align: center; border-bottom: 1px solid #e2e8f0;
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: #dbeafe; color: #1d4ed8;
      padding: 4px 14px; border-radius: 999px;
      font-size: 0.78rem; font-weight: 600;
      letter-spacing: 0.04em; text-transform: uppercase;
      margin-bottom: 24px;
    }
    .hero-titulo {
      font-size: clamp(2.2rem, 5vw, 3.6rem);
      font-weight: 800; color: #0f172a;
      letter-spacing: -0.04em; line-height: 1.1;
      max-width: 800px; margin: 0 auto 20px;
    }
    .hero-titulo span { color: #2563eb; }
    .hero-sub {
      font-size: 1.15rem; color: #475569; max-width: 580px;
      margin: 0 auto 40px; line-height: 1.7;
    }
    .hero-acciones {
      display: flex; gap: 14px; justify-content: center;
      flex-wrap: wrap; margin-bottom: 56px;
    }
    .btn-hero-primario {
      background: #2563eb; color: white;
      padding: 14px 32px; border-radius: 10px;
      font-size: 1rem; font-weight: 700;
      text-decoration: none; transition: background 0.15s, transform 0.1s;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-hero-primario:hover { background: #1d4ed8; transform: translateY(-1px); }
    .btn-hero-sec {
      background: white; color: #0f172a;
      padding: 14px 32px; border-radius: 10px;
      font-size: 1rem; font-weight: 600;
      text-decoration: none; border: 1.5px solid #e2e8f0;
      transition: border-color 0.15s, transform 0.1s;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .btn-hero-sec:hover { border-color: #2563eb; transform: translateY(-1px); }

    /* ── Mock app screenshot ─────────────────── */
    .hero-demo {
      max-width: 880px; margin: 0 auto;
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 32px 80px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06);
      background: white;
    }
    .demo-barra {
      background: #f8fafc; border-bottom: 1px solid #e2e8f0;
      padding: 10px 16px; display: flex; align-items: center; gap: 8px;
    }
    .demo-dot { width: 10px; height: 10px; border-radius: 50%; }
    .demo-url {
      flex: 1; background: white; border: 1px solid #e2e8f0;
      border-radius: 5px; padding: 3px 10px;
      font-size: 0.78rem; color: #94a3b8;
    }
    .demo-cuerpo {
      display: flex; height: 340px;
    }
    .demo-sidebar {
      width: 180px; background: white;
      border-right: 1px solid #e2e8f0; padding: 16px 10px;
      flex-shrink: 0;
    }
    .demo-brand {
      display: flex; align-items: center; gap: 8px;
      padding: 0 4px 14px; margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .demo-brand-icon {
      width: 24px; height: 24px; border-radius: 6px;
      background: #2563eb; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px;
    }
    .demo-brand-txt {
      font-size: 0.78rem; font-weight: 700; color: #0f172a;
    }
    .demo-nav-item {
      padding: 6px 8px; border-radius: 5px;
      font-size: 0.72rem; color: #64748b;
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 2px;
    }
    .demo-nav-item.activo {
      background: #eff6ff; color: #2563eb; font-weight: 600;
    }
    .demo-contenido {
      flex: 1; padding: 20px 24px; background: #f8fafc; overflow: hidden;
    }
    .demo-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
      margin-bottom: 16px;
    }
    .demo-stat {
      background: white; border: 1px solid #e2e8f0;
      border-radius: 8px; padding: 12px;
    }
    .demo-stat-lbl { font-size: 0.6rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
    .demo-stat-val { font-size: 1.3rem; font-weight: 800; color: #0f172a; margin-top: 2px; }
    .demo-tabla-wrap {
      background: white; border: 1px solid #e2e8f0;
      border-radius: 8px; overflow: hidden;
    }
    .demo-tabla-head {
      display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr;
      padding: 8px 14px; border-bottom: 1px solid #e2e8f0;
      font-size: 0.6rem; color: #94a3b8; font-weight: 700;
      text-transform: uppercase;
    }
    .demo-tabla-row {
      display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr;
      padding: 9px 14px; border-bottom: 1px solid #f1f5f9;
      font-size: 0.7rem; color: #334155; align-items: center;
    }
    .demo-tabla-row:last-child { border-bottom: none; }
    .demo-badge {
      display: inline-block; padding: 2px 7px;
      border-radius: 4px; font-size: 0.6rem; font-weight: 600;
    }
    .demo-badge.pendiente { background: #fef3c7; color: #92400e; }
    .demo-badge.proceso   { background: #dbeafe; color: #1e40af; }
    .demo-badge.listo     { background: #dcfce7; color: #166534; }

    /* ── Sección genérica ────────────────────── */
    .seccion { padding: 88px 48px; }
    .seccion-alt { background: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .seccion-center { text-align: center; }
    .seccion-etiqueta {
      font-size: 0.72rem; font-weight: 700; color: #2563eb;
      text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: 10px;
    }
    .seccion-titulo {
      font-size: clamp(1.6rem, 3vw, 2.4rem);
      font-weight: 800; color: #0f172a;
      letter-spacing: -0.03em; line-height: 1.2;
      margin-bottom: 14px;
    }
    .seccion-sub {
      font-size: 1.05rem; color: #64748b;
      max-width: 560px; margin: 0 auto 56px; line-height: 1.7;
    }

    /* ── Features grid ───────────────────────── */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px; max-width: 1100px; margin: 0 auto;
    }
    .feature-card {
      background: white; border: 1px solid #e2e8f0;
      border-radius: 14px; padding: 28px;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .feature-card:hover {
      box-shadow: 0 8px 30px rgba(0,0,0,0.08);
      transform: translateY(-2px);
    }
    .feature-icono {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; margin-bottom: 16px;
    }
    .feature-titulo {
      font-size: 1rem; font-weight: 700; color: #0f172a;
      margin-bottom: 8px;
    }
    .feature-desc {
      font-size: 0.9rem; color: #64748b; line-height: 1.65;
    }

    /* ── Pasos ───────────────────────────────── */
    .pasos-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 32px; max-width: 900px; margin: 0 auto;
    }
    .paso {
      text-align: center; padding: 0 16px;
    }
    .paso-num {
      width: 52px; height: 52px; border-radius: 50%;
      background: #2563eb; color: white;
      font-size: 1.3rem; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .paso-titulo {
      font-size: 1rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;
    }
    .paso-desc { font-size: 0.9rem; color: #64748b; line-height: 1.6; }

    /* ── Módulos incluidos ───────────────────── */
    .modulos-grid {
      display: flex; flex-wrap: wrap; gap: 10px;
      justify-content: center; max-width: 780px; margin: 0 auto;
    }
    .modulo-chip {
      background: white; border: 1.5px solid #e2e8f0;
      border-radius: 999px; padding: 6px 18px;
      font-size: 0.85rem; font-weight: 600; color: #334155;
      display: inline-flex; align-items: center; gap: 7px;
    }
    .modulo-chip-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #22c55e;
    }

    /* ── Precios ─────────────────────────────── */
    .precios-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px; max-width: 760px; margin: 0 auto;
    }
    .precio-card {
      background: white; border: 1.5px solid #e2e8f0;
      border-radius: 16px; padding: 32px;
    }
    .precio-card.destacado {
      border-color: #2563eb;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.1);
    }
    .precio-plan-tag {
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: #2563eb; margin-bottom: 6px;
    }
    .precio-plan-nombre {
      font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 16px;
    }
    .precio-monto {
      font-size: 2.6rem; font-weight: 800; color: #0f172a;
      letter-spacing: -0.04em; line-height: 1;
    }
    .precio-monto span { font-size: 1rem; font-weight: 500; color: #64748b; }
    .precio-desc {
      font-size: 0.85rem; color: #64748b; margin: 10px 0 24px;
    }
    .precio-lista { list-style: none; margin-bottom: 28px; }
    .precio-lista li {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.875rem; color: #334155; margin-bottom: 10px;
    }
    .precio-lista li::before {
      content: '✓'; color: #16a34a; font-weight: 700; flex-shrink: 0;
    }
    .btn-precio {
      display: block; text-align: center; padding: 12px;
      border-radius: 9px; font-weight: 600; font-size: 0.9rem;
      text-decoration: none; transition: all 0.15s;
    }
    .btn-precio-pri { background: #2563eb; color: white; }
    .btn-precio-pri:hover { background: #1d4ed8; }
    .btn-precio-sec { background: #f1f5f9; color: #0f172a; }
    .btn-precio-sec:hover { background: #e2e8f0; }

    /* ── CTA final ───────────────────────────── */
    .cta-final {
      background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
      padding: 88px 48px; text-align: center; color: white;
    }
    .cta-titulo {
      font-size: clamp(1.8rem, 3.5vw, 2.8rem);
      font-weight: 800; letter-spacing: -0.03em; margin-bottom: 16px;
    }
    .cta-sub {
      font-size: 1.1rem; opacity: 0.85; max-width: 480px;
      margin: 0 auto 40px; line-height: 1.7;
    }
    .btn-cta-blanco {
      background: white; color: #1e40af;
      padding: 14px 36px; border-radius: 10px;
      font-size: 1rem; font-weight: 700;
      text-decoration: none; display: inline-block;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn-cta-blanco:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.2);
    }

    /* ── Footer ──────────────────────────────── */
    .footer {
      background: #0f172a; color: #94a3b8;
      padding: 40px 48px; display: flex;
      justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 16px;
    }
    .footer-marca {
      display: flex; align-items: center; gap: 10px;
      font-size: 0.95rem; font-weight: 700; color: white; text-decoration: none;
    }
    .footer-icono {
      width: 28px; height: 28px; border-radius: 7px;
      background: #2563eb; display: flex; align-items: center;
      justify-content: center; font-size: 14px; color: white;
    }
    .footer-links { display: flex; gap: 24px; }
    .footer-link {
      font-size: 0.85rem; color: #94a3b8;
      text-decoration: none; transition: color 0.15s;
    }
    .footer-link:hover { color: white; }
    .footer-copy { font-size: 0.8rem; color: #475569; }
  `],
})
export class LandingComponent {}
