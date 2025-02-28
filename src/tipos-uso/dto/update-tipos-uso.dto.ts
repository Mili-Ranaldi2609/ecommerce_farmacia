import { PartialType } from '@nestjs/mapped-types';
import { CreateTiposUsoDto } from './create-tipos-uso.dto';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateTiposUsoDto extends PartialType(CreateTiposUsoDto) {
  
  @IsInt()
  @IsPositive()
  id: number;
}
