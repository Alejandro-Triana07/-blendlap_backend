export interface IHorarioBarberia {
  id_horario?: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: number;
}

export interface IHorarioExcepcion {
  id_excepcion?: number;
  id_usuario: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  motivo: string;
}