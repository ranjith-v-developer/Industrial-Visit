import { PartialType } from '@nestjs/mapped-types';
import { CreateIndInsDto } from './create-ind-ins.dto';

export class UpdateIndInsDto extends PartialType(CreateIndInsDto) {}
