import { pool } from '../database/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class ResenaModel {

  static async findByBarbero(id_barbero: number): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT r.*, 
        CONCAT(c.nombre, ' ', c.apellido) as nombre_cliente
       FROM resena r
       JOIN usuario_rol c ON c.id_usuario = r.id_cliente
       WHERE r.id_barbero = ?
       ORDER BY r.fecha DESC`,
      [id_barbero]
    );
    return rows as any[];
  }

  static async findByReserva(id_reserva: number): Promise<any> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM resena WHERE id_reserva = ?',
      [id_reserva]
    );
    return rows[0] || null;
  }

  static async create(data: {
    id_cliente: number;
    id_barbero: number;
    id_reserva: number;
    calificacion: number;
    comentario: string;
  }): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO resena (id_cliente, id_barbero, id_reserva, calificacion, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [data.id_cliente, data.id_barbero, data.id_reserva, data.calificacion, data.comentario]
    );
    return result.insertId;
  }

  static async getAll(): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT r.*,
        CONCAT(c.nombre, ' ', c.apellido) as nombre_cliente,
        CONCAT(b.nombre, ' ', b.apellido) as nombre_barbero
       FROM resena r
       JOIN usuario_rol c ON c.id_usuario = r.id_cliente
       JOIN usuario_rol b ON b.id_usuario = r.id_barbero
       ORDER BY r.fecha DESC`
    );
    return rows as any[];
  }
}