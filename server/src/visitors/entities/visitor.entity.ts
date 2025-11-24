import { IndInsEntity } from 'src/ind-ins/entities/ind-ins.entity';
import { IndustrialVisitEntity } from 'src/industrial-visit/entities/industrial-visit.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('visitor')
export class VisitorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: ['student', 'faculty'],
    nullable: false,
  })
  type: string;

  @Column({ type: 'varchar', nullable: false })
  reg_id: string;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  contact_no: string;

  @Column({ type: 'varchar', nullable: true })
  dept: string;

  @Column({ type: 'boolean', nullable: true })
  attend: boolean;

  @Column({ type: 'boolean', nullable: true, default: null })
  allowToFeedback: boolean;

  @Column({ type: 'decimal', nullable: true, default: null })
  rating: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  comments: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt?: Date;

  @ManyToOne(
    () => IndustrialVisitEntity,
    (industrialVisit) => industrialVisit.visitors,
  )
  industrialVisit: IndustrialVisitEntity;

  @ManyToOne(() => IndInsEntity, (indIns) => indIns.visitors)
  institute: IndInsEntity;
}
