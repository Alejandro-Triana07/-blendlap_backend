import { pool } from '../database/connection';
import { IGasto } from '../interfaces/gasto.interface';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class GastoModel {

  static async findAll(filtros?: { desde?: string; hasta?: string; categoria?: string }): Promise<IGasto[]> {
    let query = 'SELECT * FROM gasto WHERE 1=1';
    const valores: any[] = [];

    if (filtros?.desde) { query += ' AND fecha >= ?'; valores.push(filtros.desde); }
    if (filtros?.hasta) { query += ' AND fecha <= ?'; valores.push(filtros.hasta); }
    if (filtros?.categoria) { query += ' AND categoria = ?'; valores.push(filtros.categoria); }

    query += ' ORDER BY fecha DESC';

    const [rows] = await pool.execute<RowDataPacket[]>(query, valores);
    return rows as IGasto[];
  }

  static async findById(id: number): Promise<IGasto | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM gasto WHERE id_gasto = ?', [id]
    );
    return rows.length > 0 ? rows[0] as IGasto : null;
  }

  static async create(data: IGasto): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO gasto (nombre, categoria, monto, fecha, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [data.nombre, data.categoria, data.monto, data.fecha, data.descripcion || null]
    );
    return result.insertId;
  }

  static async update(id: number, data: Partial<IGasto>): Promise<boolean> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (data.nombre !== undefined) { campos.push('nombre = ?'); valores.push(data.nombre); }
    if (data.categoria !== undefined) { campos.push('categoria = ?'); valores.push(data.categoria); }
    if (data.monto !== undefined) { campos.push('monto = ?'); valores.push(data.monto); }
    if (data.fecha !== undefined) { campos.push('fecha = ?'); valores.push(data.fecha); }
    if (data.descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(data.descripcion); }

    if (campos.length === 0) return false;
    valores.push(id);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE gasto SET ${campos.join(', ')} WHERE id_gasto = ?`, valores
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM gasto WHERE id_gasto = ?', [id]
    );
    return result.affectedRows > 0;
  }

  static async getTotalPorMes(año: number, mes: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(monto), 0) as total FROM gasto
       WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?`,
      [mes, año]
    );
    return rows[0].total;
  }
  static async getEstadisticas(filtros?: { desde?: string; hasta?: string }): Promise<any> {
  const valores: any[] = [];
  let whereClause = '1=1';

  if (filtros?.desde) { whereClause += ' AND fecha >= ?'; valores.push(filtros.desde); }
  if (filtros?.hasta) { whereClause += ' AND fecha <= ?'; valores.push(filtros.hasta); }

  // Total y cantidad
  const [totales] = await pool.execute<RowDataPacket[]>(
    `SELECT
       COALESCE(SUM(monto), 0)  AS total,
       COUNT(*)                  AS cantidad,
       MAX(monto)                AS gasto_mas_alto,
       ROUND(AVG(monto), 0)      AS promedio
     FROM gasto WHERE ${whereClause}`,
    [...valores]
  );

  // Por categoría
  const [porCategoria] = await pool.execute<RowDataPacket[]>(
    `SELECT categoria,
       SUM(monto)  AS total,
       COUNT(*)    AS cantidad
     FROM gasto WHERE ${whereClause}
     GROUP BY categoria
     ORDER BY total DESC`,
    [...valores]
  );

  // Nombre del gasto más alto
  const [masAlto] = await pool.execute<RowDataPacket[]>(
    `SELECT nombre, monto FROM gasto
     WHERE ${whereClause}
     ORDER BY monto DESC LIMIT 1`,
    [...valores]
  );

  // Evolución diaria (últimos 30 días o rango)
  const [evolucion] = await pool.execute<RowDataPacket[]>(
    `SELECT DATE_FORMAT(fecha, '%d %b') AS dia,
       SUM(monto) AS total
     FROM gasto WHERE ${whereClause}
     GROUP BY fecha
     ORDER BY fecha ASC`,
    [...valores]
  );

  // Recientes
  const [recientes] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM gasto WHERE ${whereClause}
     ORDER BY fecha DESC LIMIT 5`,
    [...valores]
  );

  return {
    total:        totales[0].total,
    cantidad:     totales[0].cantidad,
    gasto_mas_alto: masAlto[0] || null,
    promedio:     totales[0].promedio,
    por_categoria: porCategoria,
    evolucion,
    recientes
  };
}
}