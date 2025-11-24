import { IndInsEntity } from 'src/ind-ins/entities/ind-ins.entity';

export class CreateUserDto {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  ph_no: string;
  indIns?: IndInsEntity;
  // ind_ins_id: string;
}
