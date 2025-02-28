import { IsNumber, IsPositive, IsString } from "class-validator";

export class CreatePresupuestoDto {

    @IsString()
    public descripcion: string

    @IsNumber()
    @IsPositive()
    public monto: number

    @IsNumber()
    @IsPositive()
    public cantidad: number

    @IsNumber()
    @IsPositive()
    public proveedorId: number

    @IsNumber()
    @IsPositive()
    public productoId: number

    @IsNumber()
    @IsPositive()
    public solicitudId: number

}
