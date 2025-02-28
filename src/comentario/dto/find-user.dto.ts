import { IsNumber, IsPositive } from 'class-validator';
import { PaginationDto } from '../../common';

export class FindUserDto extends PaginationDto {
  @IsNumber()
  @IsPositive()
  userId: number;
}
