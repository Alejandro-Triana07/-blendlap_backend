import { pool } from '../database/connection';
import { ITurno, ICrearTurno, IActualizarTurno } from '../interfaces/turno.interface';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class TurnoModel {

  // Obtener todos los turnos
  static async findAll(): Promise<ITurno[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT t.*,
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_barbero
       FROM turno t
       JOIN usuario_rol u ON t.id_usuario = u.id_usuario
       ORDER BY t.fecha DESC, t.hora_inicio ASC`
    );
    return rows as ITurno[];
  }

  // Obtener turno por ID
  static async findById(id: number): Promise<ITurno | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT t.*,
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_barbero
       FROM turno t
       JOIN usuario_rol u ON t.id_usuario = u.id_usuario
       WHERE t.id_turno = ?`,
      [id]
    );
    return rows.length > 0 ? (rows[0] as ITurno) : null;
  }

  // Obtener turnos por barbero
  static async findByBarbero(id_usuario: number): Promise<ITurno[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT t.*,
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_barbero
       FROM turno t
       JOIN usuario_rol u ON t.id_usuario = u.id_usuario
       WHERE t.id_usuario = ?
       ORDER BY t.fecha DESC`,
      [id_usuario]
    );
    return rows as ITurno[];
  }

  // Obtener turnos por fecha
  static async findByFecha(fecha: string): Promise<ITurno[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT t.*,
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_barbero
       FROM turno t
       JOIN usuario_rol u ON t.id_usuario = u.id_usuario
       WHERE t.fecha = ?
       ORDER BY t.hora_inicio ASC`,
      [fecha]
    );
    return rows as ITurno[];
  }

  // Crear turno
  static async create(data: ICrearTurno): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO turno (id_usuario, fecha, hora_inicio, hora_fin)
       VALUES (?, ?, ?, ?)`,
      [data.id_usuario, data.fecha, data.hora_inicio, data.hora_fin]
    );
    return result.insertId;
  }

  // Actualizar turno
  static async update(id: number, data: IActualizarTurno): Promise<boolean> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (data.fecha !== undefined) { campos.push('fecha = ?'); valores.push(data.fecha); }
    if (data.hora_inicio !== undefined) { campos.push('hora_inicio = ?'); valores.push(data.hora_inicio); }
    if (data.hora_fin !== undefined) { campos.push('hora_fin = ?'); valores.push(data.hora_fin); }

    if (campos.length === 0) return false;

    valores.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE turno SET ${campos.join(', ')} WHERE id_turno = ?`,
      valores
    );
    return result.affectedRows > 0;
  }

  // Eliminar turno
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM turno WHERE id_turno = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Rendimiento por barbero (RF17)
  static async getRendimiento(id_usuario: number, fechaInicio: string, fechaFin: string) {
    // Servicios por reserva
    const [reservas] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(DISTINCT r.id_reserva) AS total_reservas,
        COUNT(rs.id_servicio) AS total_servicios,
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_barbero
       FROM reserva r
       JOIN usuario_rol u ON r.id_barbero = u.id_usuario
       LEFT JOIN reserva_servicio rs ON r.id_reserva = rs.id_reserva
       WHERE r.id_barbero = ?
       AND r.fecha BETWEEN ? AND ?
       AND r.estado = 'completada'
       GROUP BY r.id_barbero`,
      [id_usuario, fechaInicio, fechaFin]
    );

    // Cortes presenciales
    const [presenciales] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) AS total_cortes,
        SUM(valor_cobrado) AS total_ingresos
       FROM corte_presencial
       WHERE id_barbero = ?
       AND DATE(fecha) BETWEEN ? AND ?`,
      [id_usuario, fechaInicio, fechaFin]
    );

    // Turnos trabajados
    const [turnos] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total_turnos
       FROM turno
       WHERE id_usuario = ?
       AND fecha BETWEEN ? AND ?`,
      [id_usuario, fechaInicio, fechaFin]
    );

    return {
      nombre_barbero: reservas[0]?.nombre_barbero || '',
      periodo: { fechaInicio, fechaFin },
      turnos_trabajados: turnos[0].total_turnos,
      total_reservas: reservas[0]?.total_reservas || 0,
      total_servicios: reservas[0]?.total_servicios || 0,
      cortes_presenciales: presenciales[0]?.total_cortes || 0,
      total_ingresos: presenciales[0]?.total_ingresos || 0
    };
  }
}