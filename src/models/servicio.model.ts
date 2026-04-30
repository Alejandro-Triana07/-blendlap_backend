import { pool } from '../database/connection';
import { IServicio, ICrearServicio, IActualizarServicio } from '../interfaces/servicio.interface';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class ServicioModel {

  // Obtener todos los servicios
  static async findAll(): Promise<IServicio[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM servicio ORDER BY nombre_servicio ASC'
    );
    return rows as IServicio[];
  }

  // Obtener servicio por ID
  static async findById(id: number): Promise<IServicio | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM servicio WHERE id_servicio = ?',
      [id]
    );
    return rows.length > 0 ? (rows[0] as IServicio) : null;
  }

  // Crear servicio
  static async create(data: ICrearServicio): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO servicio (nombre_servicio, descripcion, precio, duracion)
       VALUES (?, ?, ?, ?)`,
      [data.nombre_servicio, data.descripcion || null, data.precio, data.duracion]
    );
    return result.insertId;
  }

  // Actualizar servicio
  static async update(id: number, data: IActualizarServicio): Promise<boolean> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (data.nombre_servicio !== undefined) {
      campos.push('nombre_servicio = ?');
      valores.push(data.nombre_servicio);
    }
    if (data.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(data.descripcion);
    }
    if (data.precio !== undefined) {
      campos.push('precio = ?');
      valores.push(data.precio);
    }
    if (data.duracion !== undefined) {
      campos.push('duracion = ?');
      valores.push(data.duracion);
    }

    if (campos.length === 0) return false;

    valores.push(id);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE servicio SET ${campos.join(', ')} WHERE id_servicio = ?`,
      valores
    );
    return result.affectedRows > 0;
  }

  // Eliminar servicio
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM servicio WHERE id_servicio = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}