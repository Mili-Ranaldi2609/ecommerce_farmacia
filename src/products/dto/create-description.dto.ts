import { IsString, IsArray, IsOptional } from "class-validator";

export class CreateDescripcionDto {
  @IsString()
  descripcion: string;

  @IsArray()
  @IsOptional()
  caracteristicas?: string[];
}
