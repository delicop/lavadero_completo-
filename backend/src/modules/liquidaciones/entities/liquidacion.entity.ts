import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum EstadoLiquidacion {
  PENDIENTE = 'pendiente',
  PAGADA = 'pagada',
}

@Entity('liquidaciones')
export class Liquidacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'trabajadorId' })
  trabajador!: Usuario;

  @Column()
  trabajadorId!: string;

  @Column({ type: 'date' })
  fechaDesde!: string;

  @Column({ type: 'date' })
  fechaHasta!: string;

  @Column({ type: 'int', default: 0 })
  cantidadTurnos!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  totalServicios!: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  comisionPorcentaje!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  totalPago!: number;

  @Column({ type: 'enum', enum: EstadoLiquidacion, default: EstadoLiquidacion.PENDIENTE })
  estado!: EstadoLiquidacion;

  @Column({ type: 'timestamptz', nullable: true })
  fechaPago!: Date | null;

  @CreateDateColumn()
  fechaCreacion!: Date;
}
