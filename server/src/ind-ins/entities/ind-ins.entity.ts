import { IndustrialVisitEntity } from 'src/industrial-visit/entities/industrial-visit.entity';
import { VisitorEntity } from 'src/visitors/entities/visitor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ind_ins')
export class IndInsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 40, nullable: false })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  website: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ type: 'varchar', nullable: false })
  city: string;

  @Column({ type: 'varchar', nullable: false })
  district: string;

  @Column({ type: 'varchar', nullable: false })
  state: string;

  @Column({ type: 'integer', nullable: false })
  pincode: number;

  @Column({ type: 'varchar', length: 15 })
  ph_no: string;

  @Column({
    type: 'enum',
    enum: ['industry', 'institute'],
    nullable: false,
  })
  type: string;

  @Column({
    type: 'enum',
    enum: ['approved', 'pending', 'rejected'],
    nullable: false,
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  comments?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt?: Date;

  @Column({ type: 'varchar', length: 40, nullable: true })
  reporterEmail?: string;

  @OneToMany(
    () => IndustrialVisitEntity,
    (industrialVisit) => industrialVisit.industry,
  )
  industrialVisits: IndustrialVisitEntity;

  @OneToMany(() => VisitorEntity, (visitors) => visitors.institute)
  visitors: VisitorEntity[];
}
