import { ReservaModel } from '../models/reserva.model';
import { AuthModel } from '../models/auth.model';
import { ICrearReserva, IActualizarReserva } from '../interfaces/reserva.interface';
import { pool } from '../database/connection';
import { RowDataPacket } from 'mysql2';

export class ReservaService {

    static async getAll() {
        return await ReservaModel.findAll();
    }

    static async getById(id: number) {
        const reserva = await ReservaModel.findById(id);
        if (!reserva) throw new Error('Reserva no encontrada');
        return reserva;
    }

    static async getMisReservas(id_cliente: number) {
        return await ReservaModel.findByCliente(id_cliente);
    }

    static async getMisServicios(id_barbero: number) {
        return await ReservaModel.findByBarbero(id_barbero);
    }

    static async create(data: ICrearReserva) {
        const cliente = await AuthModel.findById(data.id_cliente);
        if (!cliente || cliente.rol !== 'cliente') {
            throw new Error('El cliente no existe o no tiene rol de cliente');
        }

        const barbero = await AuthModel.findById(data.id_barbero);
        if (!barbero || barbero.rol !== 'barbero') {
            throw new Error('El barbero no existe o no tiene rol de barbero');
        }

        if (data.id_cliente === data.id_barbero) {
            throw new Error('El cliente y el barbero no pueden ser la misma persona');
        }

        const disponible = await ReservaModel.checkDisponibilidad(
            data.id_barbero, data.fecha, data.hora
        );
        if (!disponible) {
            throw new Error('El barbero no está disponible en esa fecha y hora');
        }

        try {
            const id_reserva = await ReservaModel.create(data);
            return await ReservaModel.findById(id_reserva);
        } catch (error: any) {
            // Manejar error de duplicado amigablemente
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('El barbero ya tiene una reserva en esa fecha y hora');
            }
            throw error;
        }
    }

    static async update(id: number, data: IActualizarReserva, usuarioRol: string, usuarioId: number) {
        const reserva = await ReservaModel.findById(id);
        if (!reserva) throw new Error('Reserva no encontrada');

        if (usuarioRol === 'cliente') {
            if (reserva.id_cliente !== usuarioId) {
                throw new Error('No puedes modificar una reserva que no es tuya');
            }
            if (data.estado && data.estado !== 'cancelada') {
                throw new Error('Solo puedes cancelar tu reserva');
            }
        }

        if (data.fecha || data.hora) {
            const nuevaFecha = data.fecha || reserva.fecha.toString();
            const nuevaHora = data.hora || reserva.hora;
            const disponible = await ReservaModel.checkDisponibilidad(
                reserva.id_barbero, nuevaFecha, nuevaHora, id
            );
            if (!disponible) {
                throw new Error('El barbero no está disponible en esa fecha y hora');
            }
        }

        await ReservaModel.update(id, data);

        // Cuando se completa la reserva → crear venta automáticamente
        if (data.estado === 'completada') {
            await ReservaService.crearVentaAutomatica(id, reserva.id_barbero);
        }

        return await ReservaModel.findById(id);
    }

    private static async crearVentaAutomatica(id_reserva: number, id_barbero: number) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Obtener servicios con precio histórico
            const [servicios] = await connection.execute<RowDataPacket[]>(
                `SELECT rs.id_servicio, rs.precio_cobrado, s.nombre_servicio
         FROM reserva_servicio rs
         JOIN servicio s ON rs.id_servicio = s.id_servicio
         WHERE rs.id_reserva = ?`,
                [id_reserva]
            );

            if (servicios.length === 0) return;

            // 2. Calcular total
            const total = servicios.reduce(
                (sum: number, s: any) => sum + parseFloat(s.precio_cobrado), 0
            );

            // 3. Crear venta vinculada a la reserva
            const [ventaResult] = await connection.execute<any>(
                `INSERT INTO venta (id_reserva, id_cajero, metodo_pago, total)
         VALUES (?, ?, 'efectivo', ?)`,
                [id_reserva, id_barbero, total]
            );
            const id_venta = ventaResult.insertId;

            // 4. Insertar detalles con comisión 60% barbero
            for (const servicio of servicios) {
                const precio = parseFloat(servicio.precio_cobrado);
                await connection.execute(
                    `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, porcentaje_barbero)
           VALUES (?, ?, 1, ?, 60)`,
                    [id_venta, servicio.id_servicio, precio]
                );
            }

            await connection.commit();

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async delete(id: number) {
        const reserva = await ReservaModel.findById(id);
        if (!reserva) throw new Error('Reserva no encontrada');
        await ReservaModel.delete(id);
        return { mensaje: 'Reserva eliminada correctamente' };
    }

    static async getDisponibilidad(id_barbero: number, fecha: string) {
        if (!id_barbero || !fecha) {
            throw new Error('id_barbero y fecha son requeridos');
        }
        const horasOcupadas = await ReservaModel.getHorasOcupadas(id_barbero, fecha);
        return { id_barbero, fecha, horas_ocupadas: horasOcupadas };
    }
}