import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudPresupuestoDto } from './create-solicitud-presupuesto.dto';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateSolicitudPresupuestoDto extends PartialType(CreateSolicitudPresupuestoDto) {
  @IsString()
  @IsOptional()
  public descripcion: string

  @IsNumber()
  @IsPositive()
  @IsOptional()
  public cantidad: number

  @IsNumber()
  @IsPositive()
  @IsOptional()
  public productoId: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  public userId: number;
}
