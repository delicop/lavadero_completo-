import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  @Column({ length: 20 })
  telefono!: string;

  @Column({ type: 'varchar', unique: true, length: 150, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cedula!: string | null;

  @CreateDateColumn()
  fechaRegistro!: Date;
}
