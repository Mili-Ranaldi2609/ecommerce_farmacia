import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateDescripcionDto } from './create-description.dto';
import { CreateTipoUsoDto } from './create-tipoDeUso.dto';

export class CreateProductDto {
  @IsString()
  public nombre: string;

  @IsNumber({ maxDecimalPlaces: 5 })
  @Min(0)
  @Type(() => Number)
  //@IsPositive()
  public precio: number;

  @IsString()
  public marca: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number) // Validación para stock
  public stock: number;

  @IsArray()
  categoriaIds?: number[];

  @IsNumber()
  tipoProductoId: number;

  // Campos para crear la descripción junto con el producto
  // @IsString()
  // public descripcion: string;

  // @IsArray()
  // @IsOptional()
  // public caracteristicas: string[];
  // }

  @ValidateNested()
  @Type(() => CreateDescripcionDto)
  public descripcion: CreateDescripcionDto;

  @ValidateNested()
  @Type(() => CreateTipoUsoDto)
  public tiposDeUso: CreateTipoUsoDto;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  proveedorId?: number;
}
