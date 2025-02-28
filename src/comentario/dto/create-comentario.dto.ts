import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateComentarioDto {
  @IsNumber()
  @IsPositive()
  userId: number;

  @IsNumber()
  @IsPositive()
  productId: number;

  @IsString()
  @MaxLength(20, {
    message: 'El Titulo no puede exceder los 20 caracteres',
  })
  @IsOptional()
  tituloComentario: string;

  @IsString()
  @MinLength(10, {
    message: 'El comentario debe tener al menos 10 caracteres',
  })
  @MaxLength(256, {
    message: 'El comentario no puede exceder los 256 caracteres',
  })
  @IsOptional()
  comentario: string;

  @IsInt()
  @IsPositive()
  @IsIn([1, 2, 3, 4, 5], { message: 'El rating debe ser un valor entre 1 y 5' })
  rating: number;
}
