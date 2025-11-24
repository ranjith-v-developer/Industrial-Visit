import { IndInsEntity } from 'src/ind-ins/entities/ind-ins.entity';
import { VisitorEntity } from 'src/visitors/entities/visitor.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('industrial_visit')
export class IndustrialVisitEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ type: 'varchar', nullable: false })
  course_and_dept: string;

  @Column({ type: 'integer', nullable: false })
  no_of_students: number;

  @Column({ type: 'integer', nullable: false })
  no_of_faculty: number;

  @Column({ type: 'varchar', nullable: false })
  contact_person: string;

  @Column({ type: 'varchar', length: 15, nullable: false })
  contact_no: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  alternative_contact_no?: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  food_provide?: boolean;

  @Column({ type: 'integer', nullable: false })
  available_institute: number;

  @Column({ type: 'varchar', nullable: false })
  start_date: string;

  @Column({ type: 'varchar', nullable: false })
  end_date: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  location: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt?: Date;

  @ManyToOne(() => IndInsEntity, (indIns) => indIns.industrialVisits)
  industry: IndInsEntity;

  @OneToMany(() => VisitorEntity, (visitors) => visitors.industrialVisit)
  visitors: VisitorEntity[];
}
