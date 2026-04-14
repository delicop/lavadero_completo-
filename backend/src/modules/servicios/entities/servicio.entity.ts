import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Unique(['tipoVehiculo', 'nombre', 'tenantId'])
@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50, default: '' })
  tipoVehiculo!: string;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'int' })
  duracionMinutos!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  precio!: number;

  @Column({ default: true })
  activo!: boolean;

  @Column({ type: 'varchar', nullable: true })
  tenantId!: string | null;

  @CreateDateColumn()
  fechaRegistro!: Date;
}
