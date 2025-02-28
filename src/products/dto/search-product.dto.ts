import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class SearchProductDto {
  @IsOptional()
  @IsString()
  marca?: any;

  @IsOptional()
  @IsString()
  nombre?: any;

  @IsOptional()
  @IsNumber()
  precioMin?: number;

  @IsOptional()
  @IsNumber()
  precioMax?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
