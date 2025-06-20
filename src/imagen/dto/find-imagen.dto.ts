
import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindImagenByIdDto {
  @ApiProperty({ description: 'ID de la imagen a buscar' })
  @IsNumber()
  @IsPositive()
  idImg: number;
}