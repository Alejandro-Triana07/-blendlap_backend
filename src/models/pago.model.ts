import { pool } from '../database/connection';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { IPagoOnline } from '../interfaces/pago.interface';

export class PagoModel {

  static async inicializarTabla(): Promise<void> {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS pago_online (
        id_pago              INT AUTO_INCREMENT PRIMARY KEY,
        referencia           VARCHAR(100) UNIQUE NOT NULL,
        id_usuario           INT NOT NULL,
        items                JSON NOT NULL,
        total                DECIMAL(10,2) NOT NULL,
        estado               ENUM('pendiente','aprobado','rechazado','error') DEFAULT 'pendiente',
        wompi_transaction_id VARCHAR(200) NULL,
        wompi_status         VARCHAR(50)  NULL,
        id_venta             INT NULL,
        fecha_creacion       DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion  DATETIME ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci
    `);
  }

  static async crear(
    referencia: string,
    id_usuario: number,
    items: object,
    total: number
  ): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO pago_online (referencia, id_usuario, items, total)
       VALUES (?, ?, ?, ?)`,
      [referencia, id_usuario, JSON.stringify(items), total]
    );
    return result.insertId;
  }

  static async findByReferencia(referencia: string): Promise<IPagoOnline | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM pago_online WHERE referencia = ?',
      [referencia]
    );
    return rows.length > 0 ? (rows[0] as IPagoOnline) : null;
  }

  static async findByTransactionId(transactionId: string): Promise<IPagoOnline | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM pago_online WHERE wompi_transaction_id = ?',
      [transactionId]
    );
    return rows.length > 0 ? (rows[0] as IPagoOnline) : null;
  }

  static async getMisCompras(id_usuario: number): Promise<IPagoOnline[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM pago_online WHERE id_usuario = ? ORDER BY fecha_creacion DESC`,
      [id_usuario]
    );
    return rows as IPagoOnline[];
  }

  static async actualizarEstado(
    referencia: string,
    estado: 'pendiente' | 'aprobado' | 'rechazado' | 'error',
    transactionId?: string,
    wompiStatus?: string,
    idVenta?: number
  ): Promise<void> {
    await pool.execute(
      `UPDATE pago_online
       SET estado = ?, wompi_transaction_id = ?, wompi_status = ?, id_venta = ?
       WHERE referencia = ?`,
      [estado, transactionId || null, wompiStatus || null, idVenta || null, referencia]
    );
  }
}
