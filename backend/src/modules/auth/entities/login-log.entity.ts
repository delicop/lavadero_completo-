import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('login_logs')
export class LoginLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  usuarioId!: string;

  @Column({ length: 150 })
  email!: string;

  @Column({ length: 200 })
  nombre!: string;

  @Column({ length: 20 })
  rol!: string;

  @Column({ type: 'varchar', nullable: true })
  tenantId!: string | null;

  @CreateDateColumn()
  fechaHora!: Date;
}
