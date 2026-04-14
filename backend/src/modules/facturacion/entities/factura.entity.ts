import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Turno } from '../../turnos/entities/turno.entity';

export enum MetodoPago {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
  DEBITO = 'debito',
  CREDITO = 'credito',
}

@Entity('facturas')
@Index(['fechaEmision'])
export class Factura {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Turno, { nullable: false })
  @JoinColumn({ name: 'turnoId' })
  turno!: Turno;

  @Column({ unique: true })
  turnoId!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total!: number;

  @Column({ type: 'enum', enum: MetodoPago })
  metodoPago!: MetodoPago;

  @Column({ type: 'text', nullable: true })
  observaciones!: string | null;

  @Column({ type: 'varchar', nullable: true })
  tenantId!: string | null;

  @CreateDateColumn()
  fechaEmision!: Date;
}
