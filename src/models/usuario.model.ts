import { pool } from '../database/connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class UsuarioModel {

  // Buscar cliente por nombre, teléfono o correo
  static async buscarClientes(termino: string): Promise<RowDataPacket[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id_usuario, nombre, apellido, correo_electronico, telefono, observaciones, estado
       FROM usuario_rol
       WHERE rol = 'cliente'
       AND (
         nombre LIKE ? OR
         apellido LIKE ? OR
         telefono LIKE ? OR
         correo_electronico LIKE ?
       )`,
      [`%${termino}%`, `%${termino}%`, `%${termino}%`, `%${termino}%`]
    );
    return rows;
  }

  // Obtener todos los clientes
  static async findAllClientes(): Promise<RowDataPacket[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id_usuario, nombre, apellido, correo_electronico, telefono, observaciones, estado, fecha_creacion
       FROM usuario_rol
       WHERE rol = 'cliente'
       ORDER BY nombre ASC`
    );
    return rows;
  }

  // Actualizar datos del cliente
  static async updateCliente(id: number, data: any): Promise<boolean> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (data.nombre !== undefined) { campos.push('nombre = ?'); valores.push(data.nombre); }
    if (data.apellido !== undefined) { campos.push('apellido = ?'); valores.push(data.apellido); }
    if (data.telefono !== undefined) { campos.push('telefono = ?'); valores.push(data.telefono); }
    if (data.observaciones !== undefined) { campos.push('observaciones = ?'); valores.push(data.observaciones); }

    if (campos.length === 0) return false;

    valores.push(id);
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE usuario_rol SET ${campos.join(', ')} WHERE id_usuario = ? AND rol = 'cliente'`,
      valores
    );
    return result.affectedRows > 0;
  }

  // Contar cortes del cliente (reservas completadas + cortes presenciales)
  static async contarCortes(id_cliente: number): Promise<number> {
    const [reservas] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM reserva
       WHERE id_cliente = ? AND estado = 'completada'`,
      [id_cliente]
    );

    const [presenciales] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM corte_presencial
       WHERE id_cliente = ?`,
      [id_cliente]
    );

    return reservas[0].total + presenciales[0].total;
  }

  // Registrar corte presencial
  static async registrarCortePresencial(id_cliente: number, id_barbero: number, valor_cobrado: number, descuento: boolean): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO corte_presencial (id_cliente, id_barbero, valor_cobrado, descuento_aplicado)
       VALUES (?, ?, ?, ?)`,
      [id_cliente, id_barbero, valor_cobrado, descuento ? 1 : 0]
    );
    return result.insertId;
  }
}