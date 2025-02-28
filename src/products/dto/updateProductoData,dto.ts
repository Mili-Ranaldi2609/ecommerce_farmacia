import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray, IsInt, IsBoolean, IsString, IsNumber } from 'class-validator';

export class UpdateProductoDataDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNumber()
  precio?: number;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsArray()
  categoriasIds?: number[];  // IDs de las categorías a asociar

  @IsOptional()
  tipoProductoId?: number;


}
