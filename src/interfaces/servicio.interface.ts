export interface IServicio {
  id_servicio: number;
  nombre_servicio: string;
  descripcion: string | null;
  precio: number;
  duracion: number;
}

export interface ICrearServicio {
  nombre_servicio: string;
  descripcion?: string;
  precio: number;
  duracion: number;
}

export interface IActualizarServicio {
  nombre_servicio?: string;
  descripcion?: string;
  precio?: number;
  duracion?: number;
}