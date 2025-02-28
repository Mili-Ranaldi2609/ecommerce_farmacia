import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {
  
  @IsNumber()
  @IsPositive()
  id: number
  
  @IsString()
  public nombreCategoria: string;
}
