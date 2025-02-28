import { IsNumber, IsPositive } from 'class-validator';

export class FindOneRecetaDto {
  @IsNumber()
  @IsPositive()
  idReceta: number;
}
