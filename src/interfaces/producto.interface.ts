export interface IProducto {
  id_producto: number;
  codigo_producto: string;
  nombre_producto: string;
  descripcion: string | null;
  precio: number;
  stock: number;
}

export interface ICrearProducto {
  codigo_producto: string;
  nombre_producto: string;
  descripcion?: string;
  precio: number;
  stock?: number;
}

export interface IActualizarProducto {
  codigo_producto?: string;
  nombre_producto?: string;
  descripcion?: string;
  precio?: number;
}

export interface ICrearMovimiento {
  id_producto: number;
  tipo_movimiento: 'Entrada' | 'Salida';
  cantidad: number;
}