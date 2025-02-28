import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class FindOneProvedoresDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  idProveedor: number;
}
