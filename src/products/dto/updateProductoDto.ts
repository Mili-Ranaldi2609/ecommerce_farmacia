import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsArray, IsInt, IsBoolean, IsString, IsNumber } from 'class-validator';

export class UpdateProductoDto extends PartialType(CreateProductDto) {
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
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsArray()
  categoriasIds?: number[];  // IDs de las categorías a asociar

  @IsOptional()
  tipoProductoId?: number;

  @IsOptional()
  @IsArray()
  descuentoIds?: number[];  // IDs de los descuentos a asociar

  @IsOptional()
  descripcionId?: number;
}
