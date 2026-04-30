import { pool } from '../database/connection';
import { ResultSetHeader } from 'mysql2';

export class HistorialModel {

  static async registrar(
    id_usuario: number,
    accion: string,
    tabla: string,
    id_registro: number,
    detalle: string
  ): Promise<void> {
    await pool.execute<ResultSetHeader>(
      `INSERT INTO historial_cambios (id_usuario, accion, tabla, id_registro, detalle)
       VALUES (?, ?, ?, ?, ?)`,
      [id_usuario, accion, tabla, id_registro, detalle]
    );
  }

  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT h.*, 
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario
       FROM historial_cambios h
       JOIN usuario_rol u ON h.id_usuario = u.id_usuario
       ORDER BY h.fecha DESC`
    );
    return rows;
  }
}