export interface IServicio {
  id_servicio?: number;
  nombre_servicio: string;
  descripcion?: string;
  precio: number;
  duracion: number;
  imagen?: string;
}

export interface ICrearServicio {
  nombre_servicio: string;
  descripcion?: string;
  precio: number;
  duracion: number;
  imagen?: string;
  categoria?: string;
}

export interface IActualizarServicio {
  nombre_servicio?: string;
  descripcion?: string;
  precio?: number;
  duracion?: number;
  imagen?: string;
  categoria?: string;
  estado?: 'activo' | 'inactivo';
}