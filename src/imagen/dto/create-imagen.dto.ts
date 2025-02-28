import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateImagenDto {
  @IsString()
  tipoImagen: string;

  @IsString()
  @IsOptional()
  descripcion: string;

  @IsUrl()
  urlImagen: string;

  @IsInt()
  @IsPositive()
  productoId: number;
  //@IsNumber()
  //@IsPositive()
  //userId: number;
}
