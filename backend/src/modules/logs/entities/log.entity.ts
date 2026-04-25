import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum TipoLog {
  ERROR       = 'error',
  ADVERTENCIA = 'advertencia',
  INFO        = 'info',
}

export enum OrigenLog {
  FRONTEND = 'frontend',
  BACKEND  = 'backend',
}

@Entity('logs_sistema')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: true })
  tenantId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  usuarioId!: string | null;

  @Column({ type: 'enum', enum: TipoLog, default: TipoLog.ERROR })
  tipo!: TipoLog;

  @Column({ type: 'enum', enum: OrigenLog })
  origen!: OrigenLog;

  @Column({ type: 'varchar', length: 500 })
  mensaje!: string;

  @Column({ type: 'text', nullable: true })
  detalle!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ruta!: string | null;

  @Column({ type: 'boolean', default: false })
  resuelto!: boolean;

  @CreateDateColumn()
  fechaCreacion!: Date;
}
