import { PartialType } from '@nestjs/swagger';
import { CreateIndustrialVisitDto } from './create-industrial-visit.dto';

export class UpdateIndustrialVisitDto extends PartialType(
  CreateIndustrialVisitDto,
) {}
