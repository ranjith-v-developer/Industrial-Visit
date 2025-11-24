import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IndInsEntity } from 'src/ind-ins/entities/ind-ins.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  firstName: string;

  @Column({ type: 'varchar', nullable: false })
  lastName: string;

  @Column({ type: 'varchar', length: 40, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({
    type: 'enum',
    enum: ['industry', 'institute', 'support'],
    nullable: false,
    update: false,
  })
  role: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  ph_no: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt?: Date;

  @OneToOne(() => IndInsEntity)
  @JoinColumn({ name: 'ind_ins_id' })
  indIns: IndInsEntity;
}
