import { IsString, IsArray, IsOptional } from "class-validator";

export class CreateTipoUsoDto {
  @IsString()
  descripcion: string;

  @IsArray()
  @IsOptional()
  tiposDeUso?: string[];
}
