
import { Type } from 'class-transformer';
import { IsOptional, IsArray, IsString, IsNumber, ValidateNested } from 'class-validator';
export class UpdateProductDescriptionDto {
  @IsOptional()
  @IsString()
  descripcion?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  caracteristicas?: string[];
}

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
  @ValidateNested()
  @Type(() => UpdateProductDescriptionDto) 
  descripcion?: UpdateProductDescriptionDto;
  @IsOptional()
  @IsArray()
  categoriasIds?: number[];  // IDs de las categorías a asociar

  @IsOptional()
  tipoProductoId?: number;


}
