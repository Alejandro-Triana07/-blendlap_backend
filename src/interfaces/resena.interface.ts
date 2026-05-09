export interface IResena {
  id_resena?: number;
  id_cliente: number;
  id_barbero: number;
  id_reserva: number;
  calificacion: number;
  comentario?: string;
  fecha?: string;
}