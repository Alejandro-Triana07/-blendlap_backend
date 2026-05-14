export type PlazoCredito  = '1_semana' | '1_quincena' | '2_quincenas' | '1_mes';
export type EstadoCredito = 'pendiente' | 'activo' | 'pagado' | 'vencido';
export type MetodoPago    = 'efectivo' | 'nequi' | 'otro';

export interface ICredito {
  id_credito?:       number;
  id_cliente?:       number | null;
  nombre_cliente:    string;
  telefono_cliente:  string;
  monto_total:       number;
  saldo_pendiente:   number;
  plazo:             PlazoCredito;
  fecha_vencimiento?: string;
  estado?:           EstadoCredito;
  id_admin?:         number;
  observaciones?:    string;
  fecha_creacion?:   string;
}

export interface ICreditoProducto {
  id_producto:     number;
  cantidad:        number;
  precio_unitario: number;
  subtotal:        number;
}

export interface ICreditoAbono {
  id_abono?:    number;
  id_credito:   number;
  monto:        number;
  metodo_pago:  MetodoPago;
  id_admin?:    number;
  observacion?: string;
  fecha?:       string;
}

export interface ICrearCredito {
  id_cliente?:      number | null;
  nombre_cliente:   string;
  telefono_cliente: string;
  plazo:            PlazoCredito;
  observaciones?:   string;
  productos:        ICreditoProducto[];
}

export interface IRegistrarAbono {
  id_credito:   number;
  monto:        number;
  metodo_pago:  MetodoPago;
  observacion?: string;
}