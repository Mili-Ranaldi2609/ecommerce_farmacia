import { PartialType } from '@nestjs/mapped-types';
import { CreateDescripcionDto } from './create-descripcion.dto';
import { IsArray, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateDescripcionDto {

  @IsInt()
  @IsPositive()
  public id: number

  @IsInt()
  public idProducto: number

  @IsString()
  @IsOptional()
  public descripcion: string;

  @IsArray()
  @IsOptional()
  public caracteristicas: string[];

}
