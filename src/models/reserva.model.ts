import { pool } from '../database/connection';
import { IReserva, ICrearReserva, IActualizarReserva } from '../interfaces/reserva.interface';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class ReservaModel {

    // Obtener todas las reservas
    static async findAll(): Promise<IReserva[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT r.*,
        CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
        CONCAT(b.nombre, ' ', b.apellido) AS nombre_barbero,
        GROUP_CONCAT(rs.id_servicio) AS servicios
       FROM reserva r
       JOIN usuario_rol c ON r.id_cliente = c.id_usuario
       JOIN usuario_rol b ON r.id_barbero = b.id_usuario
       LEFT JOIN reserva_servicio rs ON r.id_reserva = rs.id_reserva
       GROUP BY r.id_reserva
       ORDER BY r.fecha DESC, r.hora DESC`
        );
        return rows.map((r: any) => ({
            ...r,
            servicios: r.servicios ? r.servicios.split(',').map(Number) : []
        })) as IReserva[];
    }

    // Obtener reserva por ID
    static async findById(id: number): Promise<IReserva | null> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT r.*,
        CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
        CONCAT(b.nombre, ' ', b.apellido) AS nombre_barbero,
        GROUP_CONCAT(rs.id_servicio) AS servicios
       FROM reserva r
       JOIN usuario_rol c ON r.id_cliente = c.id_usuario
       JOIN usuario_rol b ON r.id_barbero = b.id_usuario
       LEFT JOIN reserva_servicio rs ON r.id_reserva = rs.id_reserva
       WHERE r.id_reserva = ?
       GROUP BY r.id_reserva`,
            [id]
        );
        if (rows.length === 0) return null;
        const r: any = rows[0];
        return {
            ...r,
            servicios: r.servicios ? r.servicios.split(',').map(Number) : []
        } as IReserva;
    }

    // Obtener reservas por cliente
    static async findByCliente(id_cliente: number): Promise<IReserva[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT r.*,
        CONCAT(b.nombre, ' ', b.apellido) AS nombre_barbero,
        GROUP_CONCAT(rs.id_servicio) AS servicios
       FROM reserva r
       JOIN usuario_rol b ON r.id_barbero = b.id_usuario
       LEFT JOIN reserva_servicio rs ON r.id_reserva = rs.id_reserva
       WHERE r.id_cliente = ?
       GROUP BY r.id_reserva
       ORDER BY r.fecha DESC, r.hora DESC`,
            [id_cliente]
        );
        return rows.map((r: any) => ({
            ...r,
            servicios: r.servicios ? r.servicios.split(',').map(Number) : []
        })) as IReserva[];
    }

    // Obtener reservas por barbero
    static async findByBarbero(id_barbero: number): Promise<IReserva[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT r.*,
        CONCAT(c.nombre, ' ', c.apellido) AS nombre_cliente,
        GROUP_CONCAT(rs.id_servicio) AS servicios
       FROM reserva r
       JOIN usuario_rol c ON r.id_cliente = c.id_usuario
       LEFT JOIN reserva_servicio rs ON r.id_reserva = rs.id_reserva
       WHERE r.id_barbero = ?
       GROUP BY r.id_reserva
       ORDER BY r.fecha DESC, r.hora DESC`,
            [id_barbero]
        );
        return rows.map((r: any) => ({
            ...r,
            servicios: r.servicios ? r.servicios.split(',').map(Number) : []
        })) as IReserva[];
    }

    // Verificar disponibilidad
    static async checkDisponibilidad(
        id_barbero: number,
        fecha: string,
        hora: string,
        excludeId?: number
    ): Promise<boolean> {
        let query = `SELECT COUNT(*) as total FROM reserva
                 WHERE id_barbero = ? AND fecha = ? AND hora = ?
                 AND estado NOT IN ('cancelada')`;
        const params: any[] = [id_barbero, fecha, hora];

        if (excludeId) {
            query += ' AND id_reserva != ?';
            params.push(excludeId);
        }

        const [rows] = await pool.execute<RowDataPacket[]>(query, params);
        return rows[0].total === 0;
    }

    static async create(data: ICrearReserva): Promise<number> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insertar reserva
            const [result] = await connection.execute<ResultSetHeader>(
                `INSERT INTO reserva (id_cliente, id_barbero, fecha, hora)
       VALUES (?, ?, ?, ?)`,
                [data.id_cliente, data.id_barbero, data.fecha, data.hora]
            );
            const id_reserva = result.insertId;

            // 2. Insertar servicios CON precio histórico
            for (const id_servicio of data.servicios) {
                // Obtener precio actual del servicio
                const [servicioRows] = await connection.execute<RowDataPacket[]>(
                    'SELECT precio FROM servicio WHERE id_servicio = ?',
                    [id_servicio]
                );

                if (servicioRows.length === 0) {
                    throw new Error(`Servicio ${id_servicio} no encontrado`);
                }

                const precio_cobrado = servicioRows[0].precio;

                await connection.execute(
                    `INSERT INTO reserva_servicio (id_reserva, id_servicio, precio_cobrado)
         VALUES (?, ?, ?)`,
                    [id_reserva, id_servicio, precio_cobrado]
                );
            }

            await connection.commit();
            return id_reserva;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Actualizar reserva
    static async update(id: number, data: IActualizarReserva): Promise<boolean> {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Actualizar campos de reserva
            const campos: string[] = [];
            const valores: any[] = [];

            if (data.fecha !== undefined) { campos.push('fecha = ?'); valores.push(data.fecha); }
            if (data.hora !== undefined) { campos.push('hora = ?'); valores.push(data.hora); }
            if (data.estado !== undefined) { campos.push('estado = ?'); valores.push(data.estado); }
            if (data.recordatorio !== undefined) { campos.push('recordatorio = ?'); valores.push(data.recordatorio ? 1 : 0); }

            if (campos.length > 0) {
                valores.push(id);
                await connection.execute(
                    `UPDATE reserva SET ${campos.join(', ')} WHERE id_reserva = ?`,
                    valores
                );
            }

            // Actualizar servicios si se proporcionan
            if (data.servicios !== undefined) {
                await connection.execute(
                    'DELETE FROM reserva_servicio WHERE id_reserva = ?',
                    [id]
                );
                for (const id_servicio of data.servicios) {
                    await connection.execute(
                        'INSERT INTO reserva_servicio (id_reserva, id_servicio) VALUES (?, ?)',
                        [id, id_servicio]
                    );
                }
            }

            await connection.commit();
            return true;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Eliminar reserva
    static async delete(id: number): Promise<boolean> {
        const [result] = await pool.execute<ResultSetHeader>(
            'DELETE FROM reserva WHERE id_reserva = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
    // Obtener horas ocupadas de un barbero en una fecha
    static async getHorasOcupadas(id_barbero: number, fecha: string): Promise<string[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            `SELECT hora FROM reserva
     WHERE id_barbero = ? AND fecha = ?
     AND estado NOT IN ('cancelada')`,
            [id_barbero, fecha]
        );
        return rows.map((r: any) => r.hora);
    }
}