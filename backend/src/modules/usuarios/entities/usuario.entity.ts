import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum RolUsuario {
  ADMIN = 'admin',
  TRABAJADOR = 'trabajador',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 100 })
  apellido!: string;

  // Email único globalmente — simplifica el login en la fase actual de SaaS
  @Column({ unique: true, length: 150 })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.TRABAJADOR })
  rol!: RolUsuario;

  @Column({ default: true })
  activo!: boolean;

  @Column({ default: false })
  disponible!: boolean;

  @Column({ type: 'numeric', precision: 5, scale: 2, default: 50 })
  comisionPorcentaje!: number;

  @Column({ type: 'varchar', nullable: true })
  tenantId!: string | null;

  @CreateDateColumn()
  fechaRegistro!: Date;
}
