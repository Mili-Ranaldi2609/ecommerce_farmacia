import { IsNumber, IsPositive } from 'class-validator';

export class DeleteFavoritoDto {
  @IsNumber()
  @IsPositive()
  userId: number;
  @IsNumber()
  @IsPositive()
  productId: number;
}
