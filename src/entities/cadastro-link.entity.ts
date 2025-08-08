import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Paciente } from './paciente.entity';

export enum CadastroStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('cadastro_links')
export class CadastroLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true })
  token: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'isActive', default: true })
  isActive: boolean;

  @Column({ name: 'maxUses', default: 0 })
  maxUses: number;

  @Column({ name: 'currentUses', default: 0 })
  currentUses: number;

  @Column({ name: 'expiresAt', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @OneToMany(() => CadastroSubmission, submission => submission.cadastroLink)
  submissions: CadastroSubmission[];
}

@Entity('cadastro_submissions')
export class CadastroSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cadastroLinkId' })
  cadastroLinkId: string;

  @ManyToOne(() => CadastroLink, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cadastroLinkId' })
  cadastroLink: CadastroLink;

  @Column({ type: 'enum', enum: CadastroStatus, default: CadastroStatus.PENDING })
  status: CadastroStatus;

  @Column({ name: 'pacienteData', type: 'json' })
  pacienteData: any;

  @Column({ type: 'text', nullable: true })
  observacoes: string | null;

  @Column({ name: 'approvedPacienteId', type: 'uuid', nullable: true })
  approvedPacienteId: string;

  @ManyToOne(() => Paciente, { nullable: true })
  @JoinColumn({ name: 'approvedPacienteId' })
  approvedPaciente: Paciente;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
