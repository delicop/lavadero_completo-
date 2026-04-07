import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('servicios')
export class Servicio {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100, unique: true })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'int' })
  duracionMinutos!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  precio!: number;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  fechaRegistro!: Date;
}
