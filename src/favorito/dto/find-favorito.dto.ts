import { IsNumber, IsPositive } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FindFavoritoDto extends PaginationDto {
  @IsNumber()
  @IsPositive()
  userId: number;
}
