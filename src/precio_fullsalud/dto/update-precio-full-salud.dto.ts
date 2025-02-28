import { PartialType } from '@nestjs/mapped-types';
import { CreatePrecioFullSaludDto } from './create-precio-full-salud.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdatePrecioFullSaludDto extends PartialType(CreatePrecioFullSaludDto) {
  @IsNumber()
  @IsPositive()
  id: number;
}
