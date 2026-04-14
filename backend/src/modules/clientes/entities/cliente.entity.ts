import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('clientes')
@Unique(['email', 'tenantId'])
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Column({ length: 20 })
  telefono!: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cedula!: string | null;

  @Column({ type: 'varchar', nullable: true })
  tenantId!: string | null;

  @CreateDateColumn()
  fechaRegistro!: Date;
}
