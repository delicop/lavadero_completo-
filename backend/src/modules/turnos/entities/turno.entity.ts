import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';
import { Servicio } from '../../servicios/entities/servicio.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Factura } from '../../facturacion/entities/factura.entity';

export enum EstadoTurno {
  PENDIENTE = 'pendiente',
  EN_PROCESO = 'en_proceso',
  COMPLETADO = 'completado',
  CANCELADO = 'cancelado',
}

// Transiciones permitidas por estado
export const TRANSICIONES_VALIDAS: Record<EstadoTurno, EstadoTurno[]> = {
  [EstadoTurno.PENDIENTE]:   [EstadoTurno.EN_PROCESO, EstadoTurno.CANCELADO],
  [EstadoTurno.EN_PROCESO]:  [EstadoTurno.COMPLETADO, EstadoTurno.CANCELADO],
  [EstadoTurno.COMPLETADO]:  [],
  [EstadoTurno.CANCELADO]:   [],
};

@Entity('turnos')
@Index(['estado', 'fechaHora'])
export class Turno {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Cliente, { nullable: false })
  @JoinColumn({ name: 'clienteId' })
  cliente!: Cliente;

  @Column()
  clienteId!: string;

  @ManyToOne(() => Vehiculo, { nullable: false })
  @JoinColumn({ name: 'vehiculoId' })
  vehiculo!: Vehiculo;

  @Column()
  vehiculoId!: string;

  @ManyToOne(() => Servicio, { nullable: false })
  @JoinColumn({ name: 'servicioId' })
  servicio!: Servicio;

  @Column()
  servicioId!: string;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'trabajadorId' })
  trabajador!: Usuario;

  @Column()
  trabajadorId!: string;

  @Column({ type: 'timestamptz' })
  fechaHora!: Date;

  @Column({ type: 'enum', enum: EstadoTurno, default: EstadoTurno.PENDIENTE })
  estado!: EstadoTurno;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @Column({ type: 'varchar', nullable: true })
  liquidacionId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  tenantId!: string | null;

  // Relación inversa — no genera columna, solo permite cargar la factura junto al turno
  @OneToOne(() => Factura, (f) => f.turno, { nullable: true, eager: false })
  factura?: Factura;

  @CreateDateColumn()
  fechaRegistro!: Date;
}
