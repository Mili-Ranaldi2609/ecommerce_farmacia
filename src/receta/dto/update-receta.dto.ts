import { PartialType } from '@nestjs/mapped-types';
import { CreateRecetaDto } from './create-receta.dto';
import { IsOptional } from 'class-validator';

export class UpdateRecetaDto extends PartialType(CreateRecetaDto) {
  @IsOptional()
  id: number;
}
