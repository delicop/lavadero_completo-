import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 150 })
  nombre!: string;

  @Column({ length: 50, unique: true })
  slug!: string;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  fechaCreacion!: Date;

  // ── Configuración del negocio (Capa 2) ───────────────────────────────────────

  /** Nombre comercial que aparece en facturas (ej: "Lavadero El Brillante") */
  @Column({ type: 'varchar', length: 200, nullable: true })
  nombreComercial!: string | null;

  /** URL del logo del negocio */
  @Column({ type: 'varchar', length: 500, nullable: true })
  logo!: string | null;

  /** Zona horaria IANA (ej: "America/Bogota", "America/Mexico_City") */
  @Column({ length: 60, default: 'America/Bogota' })
  zonaHoraria!: string;

  /** Código ISO de moneda (ej: "COP", "MXN", "ARS") */
  @Column({ length: 10, default: 'COP' })
  moneda!: string;

  /** Número de WhatsApp para notificaciones (ej: "573001234567") */
  @Column({ type: 'varchar', length: 30, nullable: true })
  telefonoWhatsapp!: string | null;

  /** Email de contacto del negocio */
  @Column({ type: 'varchar', length: 150, nullable: true })
  emailContacto!: string | null;

  /** Dirección física del negocio */
  @Column({ type: 'varchar', length: 300, nullable: true })
  direccion!: string | null;

  /** Color primario de la marca en hex (ej: "#2563eb") */
  @Column({ type: 'varchar', length: 7, nullable: true })
  colorPrimario!: string | null;

  /** Color de fondo del sidebar en hex (ej: "#0f172a") */
  @Column({ type: 'varchar', length: 7, nullable: true })
  colorSidebar!: string | null;

  /** Color de fondo del contenido en hex (ej: "#f8fafc") */
  @Column({ type: 'varchar', length: 7, nullable: true })
  colorFondo!: string | null;

  /** Color de superficie de cards e inputs en hex (ej: "#ffffff") */
  @Column({ type: 'varchar', length: 7, nullable: true })
  colorSuperficie!: string | null;
}
