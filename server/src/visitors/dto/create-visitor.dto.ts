import { IndInsEntity } from 'src/ind-ins/entities/ind-ins.entity';
import { IndustrialVisitEntity } from 'src/industrial-visit/entities/industrial-visit.entity';

export class CreateVisitorDto {
  id?: string;
  name: string;
  type: string;
  reg_id: string;
  email: string;
  contact_no: string;
  dept: string;
  food_provide?: boolean;
  industrialVisit: IndustrialVisitEntity;
  institute: IndInsEntity;
  attend?: boolean;
  allowToFeedback?: boolean;
  rating?: number;
  comments?: string;
}
