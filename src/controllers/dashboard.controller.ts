import { Request, Response } from 'express';
import { pool } from '../database/connection';
import { RowDataPacket } from 'mysql2';

export class DashboardController {

    static async getResumen(req: Request, res: Response): Promise<void> {
        try {
            const [reservasHoy] = await pool.execute<RowDataPacket[]>(
                `SELECT COUNT(*) as total FROM reserva 
       WHERE DATE(fecha) = CURDATE() AND estado != 'cancelada'`
            );

            const [reservasMes] = await pool.execute<RowDataPacket[]>(
                `SELECT COUNT(*) as total FROM reserva 
       WHERE MONTH(fecha) = MONTH(CURDATE()) 
       AND YEAR(fecha) = YEAR(CURDATE())
       AND estado != 'cancelada'`
            );

            const [ingresosMes] = await pool.execute<RowDataPacket[]>(
                `SELECT COALESCE(SUM(s.precio), 0) as total
       FROM reserva r
       JOIN reserva_servicio rs ON rs.id_reserva = r.id_reserva
       JOIN servicio s ON s.id_servicio = rs.id_servicio
       WHERE MONTH(r.fecha) = MONTH(CURDATE())
       AND YEAR(r.fecha) = YEAR(CURDATE())
       AND r.estado = 'completada'`
            );

            const [comisionesMes] = await pool.execute<RowDataPacket[]>(
                `SELECT COALESCE(SUM(s.precio * (u.comision / 100)), 0) as total
       FROM reserva r
       JOIN reserva_servicio rs ON rs.id_reserva = r.id_reserva
       JOIN servicio s ON s.id_servicio = rs.id_servicio
       JOIN usuario_rol u ON u.id_usuario = r.id_barbero
       WHERE MONTH(r.fecha) = MONTH(CURDATE())
       AND YEAR(r.fecha) = YEAR(CURDATE())
       AND r.estado = 'completada'`
            );

            const [gastosMes] = await pool.execute<RowDataPacket[]>(
                `SELECT COALESCE(SUM(monto), 0) as total FROM gasto
       WHERE MONTH(fecha) = MONTH(CURDATE())
       AND YEAR(fecha) = YEAR(CURDATE())`
            );

            const ingresos = Number(ingresosMes[0].total);
            const comisiones = Number(comisionesMes[0].total);
            const gastos = Number(gastosMes[0].total);
            const gananciaBruta = ingresos - comisiones;
            const gananciaNeta = gananciaBruta - gastos;

            const [totalClientes] = await pool.execute<RowDataPacket[]>(
                `SELECT COUNT(*) as total FROM usuario_rol WHERE rol = 'cliente'`
            );

            const [clientesNuevosMes] = await pool.execute<RowDataPacket[]>(
                `SELECT COUNT(*) as total FROM usuario_rol 
       WHERE rol = 'cliente'
       AND MONTH(fecha_creacion) = MONTH(CURDATE())
       AND YEAR(fecha_creacion) = YEAR(CURDATE())`
            );

            const [topBarbero] = await pool.execute<RowDataPacket[]>(
                `SELECT u.nombre, u.apellido, u.foto, u.titulo,
        COUNT(r.id_reserva) as total_citas,
        COALESCE(SUM(s.precio), 0) as ingresos_generados,
        COALESCE(SUM(s.precio * (u.comision / 100)), 0) as comision_total
       FROM reserva r
       JOIN usuario_rol u ON u.id_usuario = r.id_barbero
       JOIN reserva_servicio rs ON rs.id_reserva = r.id_reserva
       JOIN servicio s ON s.id_servicio = rs.id_servicio
       WHERE MONTH(r.fecha) = MONTH(CURDATE())
       AND YEAR(r.fecha) = YEAR(CURDATE())
       AND r.estado != 'cancelada'
       GROUP BY r.id_barbero
       ORDER BY total_citas DESC
       LIMIT 1`
            );

            const [topServicio] = await pool.execute<RowDataPacket[]>(
                `SELECT s.nombre_servicio, s.imagen, COUNT(*) as total
       FROM reserva_servicio rs
       JOIN servicio s ON s.id_servicio = rs.id_servicio
       JOIN reserva r ON r.id_reserva = rs.id_reserva
       WHERE MONTH(r.fecha) = MONTH(CURDATE())
       AND YEAR(r.fecha) = YEAR(CURDATE())
       AND r.estado != 'cancelada'
       GROUP BY rs.id_servicio
       ORDER BY total DESC
       LIMIT 1`
            );

            const [ultimasReservas] = await pool.execute<RowDataPacket[]>(
                `SELECT r.id_reserva, r.fecha, r.hora, r.estado,
        CONCAT(c.nombre, ' ', c.apellido) as nombre_cliente,
        CONCAT(b.nombre, ' ', b.apellido) as nombre_barbero,
        s.nombre_servicio, s.precio
       FROM reserva r
       JOIN usuario_rol c ON c.id_usuario = r.id_cliente
       JOIN usuario_rol b ON b.id_usuario = r.id_barbero
       JOIN reserva_servicio rs ON rs.id_reserva = r.id_reserva
       JOIN servicio s ON s.id_servicio = rs.id_servicio
       ORDER BY r.fecha DESC, r.hora DESC
       LIMIT 5`
            );

            const [ingresosMeses] = await pool.execute<RowDataPacket[]>(
                `SELECT 
        DATE_FORMAT(r.fecha, '%Y-%m') as mes,
        COALESCE(SUM(s.precio), 0) as ingresos,
        COALESCE(SUM(s.precio * (u.comision / 100)), 0) as comisiones,
        COALESCE(SUM(s.precio * ((100 - u.comision) / 100)), 0) as ganancia_bruta
       FROM reserva r
       JOIN reserva_servicio rs ON rs.id_reserva = r.id_reserva
       JOIN servicio s ON s.id_servicio = rs.id_servicio
       JOIN usuario_rol u ON u.id_usuario = r.id_barbero
       WHERE r.estado = 'completada'
       AND r.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(r.fecha, '%Y-%m')
       ORDER BY mes ASC`
            );

            const [gastosMeses] = await pool.execute<RowDataPacket[]>(
                `SELECT DATE_FORMAT(fecha, '%Y-%m') as mes,
        COALESCE(SUM(monto), 0) as total_gastos
       FROM gasto
       WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(fecha, '%Y-%m')
       ORDER BY mes ASC`
            );

            const [rankingBarberos] = await pool.execute<RowDataPacket[]>(
                `SELECT u.nombre, u.apellido, u.foto, u.titulo, u.comision,
        COUNT(DISTINCT r.id_reserva) as total_citas,
        COALESCE(SUM(s.precio), 0) as ingresos_generados,
        COALESCE(SUM(s.precio * (u.comision / 100)), 0) as comision_total
       FROM usuario_rol u
       LEFT JOIN reserva r ON r.id_barbero = u.id_usuario
         AND MONTH(r.fecha) = MONTH(CURDATE())
         AND YEAR(r.fecha) = YEAR(CURDATE())
         AND r.estado = 'completada'
       LEFT JOIN reserva_servicio rs ON rs.id_reserva = r.id_reserva
       LEFT JOIN servicio s ON s.id_servicio = rs.id_servicio
       WHERE u.rol = 'barbero' AND u.estado = 'activo'
       GROUP BY u.id_usuario
       ORDER BY ingresos_generados DESC`
            );

            res.status(200).json({
                ok: true,
                data: {
                    reservasHoy: reservasHoy[0].total,
                    reservasMes: reservasMes[0].total,
                    ingresosMes: ingresos,
                    comisionesMes: comisiones,
                    gastosMes: gastos,
                    gananciaBrutaMes: gananciaBruta,
                    gananciaNeta,
                    totalClientes: totalClientes[0].total,
                    clientesNuevosMes: clientesNuevosMes[0].total,
                    topBarbero: topBarbero[0] || null,
                    topServicio: topServicio[0] || null,
                    ultimasReservas,
                    ingresosMeses,
                    gastosMeses,
                    rankingBarberos
                }
            });
        } catch (error: any) {
            res.status(500).json({ ok: false, mensaje: error.message });
        }
    }
}