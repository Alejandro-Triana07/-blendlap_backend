import { pool } from '../database/connection';
import { IProducto, ICrearProducto, IActualizarProducto, ICrearMovimiento } from '../interfaces/producto.interface';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export class ProductoModel {

  static async findAll(): Promise<IProducto[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM producto ORDER BY nombre_producto ASC'
    );
    return rows as IProducto[];
  }

  static async getStockActual(): Promise<IProducto[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM v_stock_actual'
    );
    return rows as IProducto[];
  }

  static async findById(id: number): Promise<IProducto | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM producto WHERE id_producto = ?', [id]
    );
    return rows.length > 0 ? (rows[0] as IProducto) : null;
  }

  static async findByCodigo(codigo: string): Promise<IProducto | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM producto WHERE codigo_producto = ?', [codigo]
    );
    return rows.length > 0 ? (rows[0] as IProducto) : null;
  }

  static async create(data: ICrearProducto): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO producto (codigo_producto, nombre_producto, descripcion, precio, stock)
       VALUES (?, ?, ?, ?, ?)`,
      [data.codigo_producto, data.nombre_producto, data.descripcion || null, data.precio, data.stock || 0]
    );
    return result.insertId;
  }

  static async update(id: number, data: IActualizarProducto): Promise<boolean> {
    const campos: string[] = [];
    const valores: any[] = [];

    if (data.codigo_producto !== undefined) { campos.push('codigo_producto = ?'); valores.push(data.codigo_producto); }
    if (data.nombre_producto !== undefined) { campos.push('nombre_producto = ?'); valores.push(data.nombre_producto); }
    if (data.descripcion !== undefined) { campos.push('descripcion = ?'); valores.push(data.descripcion); }
    if (data.precio !== undefined) { campos.push('precio = ?'); valores.push(data.precio); }

    if (campos.length === 0) return false;
    valores.push(id);

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE producto SET ${campos.join(', ')} WHERE id_producto = ?`, valores
    );
    return result.affectedRows > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM producto WHERE id_producto = ?', [id]
    );
    return result.affectedRows > 0;
  }

  // Solo inserta en inventario_movimiento
  // El trigger trg_actualizar_stock actualiza el stock automáticamente
  static async registrarMovimiento(id_usuario: number, data: ICrearMovimiento): Promise<void> {
    await pool.execute(
      `INSERT INTO inventario_movimiento (id_producto, id_usuario, tipo_movimiento, cantidad)
       VALUES (?, ?, ?, ?)`,
      [data.id_producto, id_usuario, data.tipo_movimiento, data.cantidad]
    );
  }

  static async getMovimientos(id_producto: number) {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT im.*,
        p.nombre_producto,
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario
       FROM inventario_movimiento im
       JOIN producto p ON im.id_producto = p.id_producto
       JOIN usuario_rol u ON im.id_usuario = u.id_usuario
       WHERE im.id_producto = ?
       ORDER BY im.fecha_actualizacion DESC`,
      [id_producto]
    );
    return rows;
  }

  static async getStockBajo(): Promise<IProducto[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM producto WHERE stock <= 5 ORDER BY stock ASC'
    );
    return rows as IProducto[];
  }
}