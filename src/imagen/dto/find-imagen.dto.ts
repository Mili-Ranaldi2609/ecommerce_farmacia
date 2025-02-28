import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsPositive } from 'class-validator';
import { CreateImagenDto } from './create-imagen.dto';

export class FindImagenDto extends PartialType(CreateImagenDto) {
  @IsNumber()
  @IsPositive()
  idImg: number;
}
