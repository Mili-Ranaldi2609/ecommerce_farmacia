import { IsNumber, IsPositive } from 'class-validator';

export class RemoveImagenDto {
  @IsNumber()
  @IsPositive()
  idImagen: number;

  @IsNumber()
  @IsPositive()
  productId: number;
}
