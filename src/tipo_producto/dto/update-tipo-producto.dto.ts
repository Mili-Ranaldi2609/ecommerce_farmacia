import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoProductoDto } from './create-tipo-producto.dto';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdateTipoProductoDto extends PartialType(CreateTipoProductoDto) {
  @IsNumber()
  @IsPositive()
  id: number;}
