export interface ITurno {
  id_turno: number;
  id_usuario: number;
  fecha: Date;
  hora_inicio: string;
  hora_fin: string;
  nombre_barbero?: string;
}

export interface ICrearTurno {
  id_usuario: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface IActualizarTurno {
  fecha?: string;
  hora_inicio?: string;
  hora_fin?: string;
}