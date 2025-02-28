import { IsNumber, IsPositive } from 'class-validator';

export class DeleteRecetaDto {
  @IsNumber()
  @IsPositive()
  idReceta: number;
}
