import { VentaModel } from '../models/venta.model';
import { ProductoModel } from '../models/producto.model';
import { ICrearVenta } from '../interfaces/venta.interface';

const PORCENTAJE_BARBERO = 60;
const PORCENTAJE_LOCAL = 40;

export class VentaService {

  static async getAll() {
    return await VentaModel.findAll();
  }

  static async getById(id: number) {
    const venta = await VentaModel.findById(id);
    if (!venta) throw new Error('Venta no encontrada');
    return venta;
  }

  static async create(id_cajero: number, data: ICrearVenta) {
    if (!data.metodo_pago) throw new Error('El método de pago es requerido');
    if (!data.detalles || data.detalles.length === 0) {
      throw new Error('La venta debe tener al menos un producto');
    }

    // Validar stock de cada producto
    for (const detalle of data.detalles) {
      const producto = await ProductoModel.findById(detalle.id_producto);
      if (!producto) throw new Error(`Producto ${detalle.id_producto} no encontrado`);
      if (producto.stock < detalle.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre_producto}. Stock actual: ${producto.stock}`);
      }
      // Asignar porcentaje barbero automáticamente
      if (!detalle.porcentaje_barbero) {
        detalle.porcentaje_barbero = PORCENTAJE_BARBERO;
      }
    }

    const id_venta = await VentaModel.create(id_cajero, data);
    return await VentaModel.findById(id_venta);
  }

  static async cierreCaja(fecha: string) {
    if (!fecha) throw new Error('La fecha es requerida');
    return await VentaModel.cierreCaja(fecha);
  }

  // Calcular comisión de una venta
  static calcularComision(subtotal: number) {
    return {
      subtotal,
      comision_barbero: subtotal * PORCENTAJE_BARBERO / 100,
      comision_local: subtotal * PORCENTAJE_LOCAL / 100
    };
  }
}