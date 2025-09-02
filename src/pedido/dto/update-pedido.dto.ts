import { Estados } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsInt, Min, ValidateNested } from "class-validator";

class DetalleUpdateDto {
  @IsInt()
  productoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class UpdatePedidoDto {
  // Si querés permitir cambiar el dueño del pedido:
  @IsInt()
  usuarioId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleUpdateDto)
  detallesPedidos: DetalleUpdateDto[]; // REQUERIDO en update

  // Opcional
  estado?: Estados;
}