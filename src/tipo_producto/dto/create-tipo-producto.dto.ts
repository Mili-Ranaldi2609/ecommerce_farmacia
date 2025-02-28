import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTipoProductoDto {

    @IsString()
    @IsNotEmpty()
    public nombreTipo: string;

    @IsBoolean()
    @IsOptional()
    available?: boolean;  // Opcional, con un valor por defecto en el modelo Prisma
    
    @IsNumber()
    @IsOptional()
    categoriaId: number;
    
    @IsNumber()
    @IsOptional()
    tipoPadreId?: number;

}
