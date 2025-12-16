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

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ unique: true })
  token: string;

  @Column({ name: 'nome' })
  title: string;

  @Column({ name: 'descricao', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => CadastroSubmission, submission => submission.cadastroLink)
  submissions: CadastroSubmission[];
}

@Entity('cadastro_submissions')
export class CadastroSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cadastro_link_id' })
  cadastroLinkId: string;

  @ManyToOne(() => CadastroLink, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cadastro_link_id' })
  cadastroLink: CadastroLink;

  @Column({ name: 'status', type: 'varchar', length: 50, default: 'pending' })
  status: CadastroStatus;

  @Column({ name: 'dados', type: 'json' })
  pacienteData: any;

  @Column({ name: 'paciente_id', type: 'uuid', nullable: true })
  approvedPacienteId: string | null;

  @ManyToOne(() => Paciente, { nullable: true })
  @JoinColumn({ name: 'paciente_id' })
  approvedPaciente: Paciente | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
