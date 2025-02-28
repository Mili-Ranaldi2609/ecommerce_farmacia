import { IsNumber, IsPositive } from 'class-validator';

export class CreateFavoritoDto {
  @IsNumber()
  @IsPositive()
  userId: number;
  @IsNumber()
  @IsPositive()
  productId: number;
}
