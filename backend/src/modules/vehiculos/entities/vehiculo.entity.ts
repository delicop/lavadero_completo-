import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

export enum TipoVehiculo {
  AUTO = 'auto',
  MOTO = 'moto',
  CAMIONETA = 'camioneta',
}

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Cliente, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clienteId' })
  cliente!: Cliente;

  @Column()
  clienteId!: string;

  @Column({ length: 10, unique: true })
  placa!: string;

  @Column({ length: 50 })
  marca!: string;

  @Column({ length: 50 })
  modelo!: string;

  @Column({ length: 30 })
  color!: string;

  @Column({ type: 'enum', enum: TipoVehiculo, default: TipoVehiculo.AUTO })
  tipo!: TipoVehiculo;

  @CreateDateColumn()
  fechaRegistro!: Date;
}
