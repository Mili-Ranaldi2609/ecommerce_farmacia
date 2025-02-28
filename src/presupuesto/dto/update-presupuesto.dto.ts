import { PartialType } from '@nestjs/mapped-types';
import { CreatePresupuestoDto } from './create-presupuesto.dto';
import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdatePresupuestoDto extends PartialType(CreatePresupuestoDto) {
  
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  public descripcion: string

  @IsNumber()
  @IsPositive()
  @IsOptional()
  public monto: number

  @IsNumber()
  @IsPositive()
  @IsOptional()
  public cantidad: number

  @IsNumber()
  @IsPositive()
  @IsOptional()
  public proveedorId: number

  @IsNumber()
  @IsPositive()
  @IsOptional()
  public productoId: number

  @IsNumber()
  @IsPositive()
  @IsOptional()
  public descargaPresupuestoId: number

  @IsNumber()
  @IsPositive()
  @IsOptional()
  public solicitudId: number
}
