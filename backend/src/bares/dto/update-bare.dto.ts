import { PartialType } from '@nestjs/mapped-types';
import { CreateBareDto } from './create-bare.dto';

export class UpdateBareDto extends PartialType(CreateBareDto) {}
