// dto/producto-con-categorias.dto.ts
export class ProductoConCategoriasDto {
    id: number;
    nombre: string;
    precio: number;
    marca: string;
    descripcion: string;
    stock: number;
    available: boolean;
    categorias: CategoriaDto[];
  }
  
  export class CategoriaDto {
    id: number;
    nombreCategoria: string;
  }
  