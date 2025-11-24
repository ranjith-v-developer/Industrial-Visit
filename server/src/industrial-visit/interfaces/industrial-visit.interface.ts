import { IndInsEntity } from 'src/ind-ins/entities/ind-ins.entity';
import { VisitorEntity } from 'src/visitors/entities/visitor.entity';

export interface IndustrialVisitRO {
  name: string;
  description: string;
  course_and_dept: string;
  no_of_students: number;
  no_of_faculty: number;
  contact_person: string;
  contact_no: string;
  alternative_contact_no?: string;
  food_provide?: boolean;
  available_institute: number;
  start_date: string;
  end_date: string;
  industry: IndInsEntity;
  visitors: VisitorEntity[];
  instituteData: any;
  location: string;
  createdAt: Date;
}
