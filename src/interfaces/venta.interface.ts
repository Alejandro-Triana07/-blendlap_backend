export interface IVenta {
  id_venta: number;
  id_reserva: number | null;
  id_cajero: number;
  fecha: Date;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'nequi' | 'otro';
  total: number;
}

export interface IDetalleVenta {
  id_detalle: number;
  id_venta: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  porcentaje_barbero: number | null;
}

export interface ICrearVenta {
  id_reserva?: number;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'nequi' | 'otro';
  detalles: ICrearDetalle[];
}

export interface ICrearDetalle {
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  porcentaje_barbero?: number;
}