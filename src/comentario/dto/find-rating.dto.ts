import { PartialType } from '@nestjs/mapped-types';
import {
  IsNumber,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindByRating extends PartialType(PaginationDto) {
  @IsNumber()
  @IsPositive()
  @Min(1, { message: 'El rating debe ser un valor mayor a 0' })
  @Max(5, { message: 'El rating debe ser un valor menor a 6' })
  rating: number;

  @IsNumber()
  @IsPositive()
  productId: number;
}
