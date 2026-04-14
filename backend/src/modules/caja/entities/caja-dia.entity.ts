import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum EstadoCajaDia {
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
}

@Entity('caja_dias')
@Unique(['fecha', 'tenantId'])
export class CajaDia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  fecha!: string; // 'YYYY-MM-DD'

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  montoInicial!: number;

  @Column({ type: 'enum', enum: EstadoCajaDia, default: EstadoCajaDia.ABIERTA })
  estado!: EstadoCajaDia;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuarioAperturaId' })
  usuarioApertura!: Usuario;

  @Column()
  usuarioAperturaId!: string;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuarioCierreId' })
  usuarioCierre!: Usuario | null;

  @Column({ nullable: true })
  usuarioCierreId!: string | null;

  @Column({ type: 'timestamptz' })
  fechaApertura!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  fechaCierre!: Date | null;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  // Columnas pre-computadas: se incrementan al crear facturas, evitan JOINs pesados en el resumen
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  ventasEfectivo!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  ventasTransferencia!: number;

  @Column({ type: 'varchar', nullable: true })
  tenantId!: string | null;

  @CreateDateColumn()
  fechaCreacion!: Date;
}
