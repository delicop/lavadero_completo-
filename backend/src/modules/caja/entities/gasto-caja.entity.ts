import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CajaDia } from './caja-dia.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

export enum TipoPagoCaja {
  EFECTIVO = 'efectivo',
  TRANSFERENCIA = 'transferencia',
}

@Entity('gastos_caja')
export class GastoCaja {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CajaDia, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cajaDiaId' })
  cajaDia!: CajaDia;

  @Column()
  cajaDiaId!: string;

  @Column({ length: 200 })
  concepto!: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monto!: number;

  @Column({ type: 'enum', enum: TipoPagoCaja })
  tipoPago!: TipoPagoCaja;

  @ManyToOne(() => Usuario, { nullable: false })
  @JoinColumn({ name: 'usuarioId' })
  usuario!: Usuario;

  @Column()
  usuarioId!: string;

  @CreateDateColumn()
  fechaRegistro!: Date;
}
