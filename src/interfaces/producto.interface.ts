export interface IProducto {
  id_producto:      number;
  codigo_producto:  string;
  nombre_producto:  string;
  descripcion:      string | null;
  precio:           number;
  stock:            number;
  categoria:        string;
  talla:            string | null;
  imagen:           string | null;
  estado:           string;
}

export interface ICrearProducto {
  codigo_producto:  string;
  nombre_producto:  string;
  descripcion?:     string;
  precio:           number;
  stock?:           number;
  categoria?:       string;
  talla?:           string;
  imagen?:          string | null;
}

export interface IActualizarProducto {
  codigo_producto?: string;
  nombre_producto?: string;
  descripcion?:     string;
  precio?:          number;
  stock?:           number;
  categoria?:       string;
  talla?:           string;
  imagen?:          string;
  estado?:          string;
}

export interface ICrearMovimiento {
  id_producto:      number;
  tipo_movimiento:  'Entrada' | 'Salida';
  cantidad:         number;
  motivo?:          string;
}