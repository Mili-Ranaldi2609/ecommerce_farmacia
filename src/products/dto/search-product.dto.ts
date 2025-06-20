import { Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class SearchProductDto {
  @IsOptional()
  @IsString()
  marca?: any;

  @IsOptional()
  @IsString()
  nombre?: any;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precioMax?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
