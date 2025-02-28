import { IsNumber, IsPositive } from 'class-validator';
import { PaginationDto } from '../../common';

export class FindProductDto extends PaginationDto {
  @IsNumber()
  @IsPositive()
  productId: number;
}
