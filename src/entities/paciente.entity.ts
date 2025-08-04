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
import { AgendaSessao } from './agenda-sessao.entity';
import { Pagamento } from './pagamento.entity';

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  endereco: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  profissao: string | null;

  @Column({ type: 'date', nullable: true })
  nascimento: Date | null;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  genero: string | null;

  @Column({ type: 'text', nullable: true })
  observacao_geral: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contato_emergencia: string | null;

  @Column({ type: 'json', nullable: true })
  medicacoes: any[] | null;

  @Column({ type: 'int', default: 0 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamento com User
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relacionamento com AgendaSessao
  @OneToMany(() => AgendaSessao, agendaSessao => agendaSessao.paciente)
  agendaSessoes: AgendaSessao[];

  // Relacionamento com Pagamento
  @OneToMany(() => Pagamento, pagamento => pagamento.paciente)
  pagamentos: Pagamento[];
} 