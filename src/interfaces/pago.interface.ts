export interface IItemPago {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  talla?: string;
}

export interface ICrearPago {
  items: IItemPago[];
  total: number;
}

export interface IPagoOnline {
  id_pago: number;
  referencia: string;
  id_usuario: number;
  items: string;
  total: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'error';
  wompi_transaction_id: string | null;
  wompi_status: string | null;
  id_venta: number | null;
  fecha_creacion: Date;
}

export interface IIniciarPagoResponse {
  referencia: string;
  amountInCents: number;
  publicKey: string;
  integrityHash: string;
  currency: string;
  redirectUrl: string;
}
