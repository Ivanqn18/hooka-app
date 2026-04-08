import { PartialType } from '@nestjs/mapped-types';
import { CreateMezclaDto } from './create-mezcla.dto';

export class UpdateMezclaDto extends PartialType(CreateMezclaDto) {}
