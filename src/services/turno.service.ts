import { TurnoModel } from '../models/turno.model';
import { ICrearTurno, IActualizarTurno } from '../interfaces/turno.interface';
import { AuthModel } from '../models/auth.model';

export class TurnoService {

  // Obtener todos
  static async getAll() {
    return await TurnoModel.findAll();
  }

  // Obtener por ID
  static async getById(id: number) {
    const turno = await TurnoModel.findById(id);
    if (!turno) throw new Error('Turno no encontrado');
    return turno;
  }

  // Obtener turnos de un barbero
  static async getByBarbero(id_usuario: number) {
    return await TurnoModel.findByBarbero(id_usuario);
  }

  // Obtener turnos por fecha
  static async getByFecha(fecha: string) {
    if (!fecha) throw new Error('La fecha es requerida');
    return await TurnoModel.findByFecha(fecha);
  }

  // Crear turno
  static async create(data: ICrearTurno) {
    if (!data.id_usuario || !data.fecha || !data.hora_inicio || !data.hora_fin) {
      throw new Error('Todos los campos son requeridos');
    }

    // Verificar que el usuario es barbero
    const usuario = await AuthModel.findById(data.id_usuario);
    if (!usuario || usuario.rol !== 'barbero') {
      throw new Error('El usuario no existe o no es barbero');
    }

    // Verificar que hora_fin > hora_inicio
    if (data.hora_fin <= data.hora_inicio) {
      throw new Error('La hora de fin debe ser mayor a la hora de inicio');
    }

    const id_turno = await TurnoModel.create(data);
    return await TurnoModel.findById(id_turno);
  }

  // Actualizar turno
  static async update(id: number, data: IActualizarTurno) {
    const turno = await TurnoModel.findById(id);
    if (!turno) throw new Error('Turno no encontrado');

    const horaInicio = data.hora_inicio || turno.hora_inicio;
    const horaFin = data.hora_fin || turno.hora_fin;

    if (horaFin <= horaInicio) {
      throw new Error('La hora de fin debe ser mayor a la hora de inicio');
    }

    await TurnoModel.update(id, data);
    return await TurnoModel.findById(id);
  }

  // Eliminar turno
  static async delete(id: number) {
    const turno = await TurnoModel.findById(id);
    if (!turno) throw new Error('Turno no encontrado');
    await TurnoModel.delete(id);
    return { mensaje: 'Turno eliminado correctamente' };
  }

  // Rendimiento por barbero
  static async getRendimiento(id_usuario: number, fechaInicio: string, fechaFin: string) {
    if (!id_usuario || !fechaInicio || !fechaFin) {
      throw new Error('id_usuario, fechaInicio y fechaFin son requeridos');
    }
    return await TurnoModel.getRendimiento(id_usuario, fechaInicio, fechaFin);
  }
}