import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateRecetaDto {
  @IsString()
  descripcion: string;

  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  productoId: number;

  @IsString()
  imagen: string;
}
