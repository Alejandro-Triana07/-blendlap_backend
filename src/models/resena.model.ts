import { pool } from '../database/connection';
import { IResena } from '../interfaces/resena.interface';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class ResenaModel {

  static async getAll(): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM resena ORDER BY fecha DESC'
    );
    return rows as any[];
  }

  static async findByBarbero(id_barbero: number): Promise<any[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT re.*,
        CONCAT(c.nombre, ' ', c.apellido) as nombre_cliente,
        c.foto as foto_cliente
       FROM resena re
       JOIN usuario_rol c ON c.id_usuario = re.id_cliente
       WHERE re.id_barbero = ?
       ORDER BY re.fecha DESC`,
      [id_barbero]
    );
    return rows as any[];
  }

  static async findByReserva(id_reserva: number): Promise<IResena | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM resena WHERE id_reserva = ?',
      [id_reserva]
    );
    return rows.length > 0 ? rows[0] as IResena : null;
  }

  static async create(data: IResena): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO resena (id_cliente, id_barbero, id_reserva, calificacion, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [data.id_cliente, data.id_barbero, data.id_reserva, data.calificacion, data.comentario || null]
    );
    return result.insertId;
  }

  static async getPromedioByBarbero(id_barbero: number): Promise<{ promedio: number; total: number }> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT AVG(calificacion) as promedio, COUNT(*) as total
       FROM resena WHERE id_barbero = ?`,
      [id_barbero]
    );
    return { promedio: rows[0].promedio || 0, total: rows[0].total || 0 };
  }
}