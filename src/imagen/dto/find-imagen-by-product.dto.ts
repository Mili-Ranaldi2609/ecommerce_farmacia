
import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindImagenByProductDto {
  @ApiProperty({ description: 'ID del producto cuyas imágenes se quieren buscar' })
  @IsNumber()
  @IsPositive()
  productoId: number;
}