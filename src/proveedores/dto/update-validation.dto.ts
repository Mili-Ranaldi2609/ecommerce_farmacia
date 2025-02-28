import { PartialGraphHost } from '@nestjs/core';
import { PartialType } from '@nestjs/mapped-types';
import { UpdateProveedoreDto } from './update-proveedore.dto';
import { IsNotEmpty, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProvpayload extends PartialType(UpdateProveedoreDto) {
  @IsPositive()
  @IsNotEmpty()
  @Type(() => Number)
  id: number;
}
