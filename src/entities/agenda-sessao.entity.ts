import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Paciente } from './paciente.entity';
import { Pagamento } from './pagamento.entity';

@Entity('agenda_sessoes')
export class AgendaSessao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'paciente_id', type: 'uuid' })
  pacienteId: string;

  @Column({ type: 'date' })
  data: Date;

  @Column({ type: 'time' })
  horario: string;

  @Column({ name: 'tipo_da_consulta', length: 100 })
  tipoDaConsulta: string;

  @Column({ length: 50 })
  modalidade: string;

  @Column({ name: 'tipo_atendimento', length: 50 })
  tipoAtendimento: string;

  @Column({ type: 'int' })
  duracao: number;

  @Column({ type: 'text', nullable: true })
  observacao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'int', default: 0 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relacionamentos
  @ManyToOne(() => User, user => user.agendaSessoes)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Paciente, paciente => paciente.agendaSessoes)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @OneToMany(() => Pagamento, pagamento => pagamento.agendaSessao)
  pagamentos: Pagamento[];
} 