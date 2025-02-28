import { IsNumber, IsPositive } from 'class-validator';

export class DeleteComentDto {
  @IsNumber()
  @IsPositive()
  id: number;
}
