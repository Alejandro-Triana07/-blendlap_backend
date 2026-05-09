export interface IGasto {
  id_gasto?: number;
  nombre: string;
  categoria: string;
  monto: number;
  fecha: string;
  descripcion?: string;
  fecha_creacion?: string;
}