import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateDescripcionDto {

  @IsInt()
  public idProducto: number

  @IsString()
  @IsOptional()
  public descripcion: string;

  @IsArray()
  @IsOptional()
  public caracteristicas: string[];

}
