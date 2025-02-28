import { IsInt, IsPositive } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindAllbyUserDto extends PaginationDto {
  @IsInt()
  @IsPositive()
  userId: number;
}
