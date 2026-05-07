import { ResenaModel } from '../models/resena.model';
import { pool } from '../database/connection';
import { RowDataPacket } from 'mysql2';

export class ResenaService {

  static async getByBarbero(id_barbero: number) {
    return await ResenaModel.findByBarbero(id_barbero);
  }

  static async getAll() {
    return await ResenaModel.getAll();
  }

  static async create(data: {
    id_cliente: number;
    id_barbero: number;
    id_reserva: number;
    calificacion: number;
    comentario: string;
  }) {
    // Verificar que la reserva existe y está completada
    const [reservas] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM reserva WHERE id_reserva = ? AND id_cliente = ? AND estado = 'completada'`,
      [data.id_reserva, data.id_cliente]
    );

    if (reservas.length === 0) {
      throw new Error('Solo puedes reseñar reservas completadas');
    }

    // Verificar que no haya reseña previa
    const existe = await ResenaModel.findByReserva(data.id_reserva);
    if (existe) {
      throw new Error('Ya existe una reseña para esta reserva');
    }

    const id_resena = await ResenaModel.create(data);
    return { id_resena, mensaje: 'Reseña creada correctamente' };
  }
}