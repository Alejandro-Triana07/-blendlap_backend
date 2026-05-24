import { GastoModel } from '../models/gasto.model';
import { IGasto } from '../interfaces/gasto.interface';

export class GastoService {

  static async getAll(filtros?: any) {
    return await GastoModel.findAll(filtros);
  }

  static async getById(id: number) {
    const gasto = await GastoModel.findById(id);
    if (!gasto) throw new Error('Gasto no encontrado');
    return gasto;
  }

  static async create(data: IGasto) {
    if (!data.nombre || !data.categoria || !data.monto || !data.fecha) {
      throw new Error('Nombre, categoría, monto y fecha son requeridos');
    }
    const id = await GastoModel.create(data);
    return { id_gasto: id, mensaje: 'Gasto creado correctamente' };
  }

  static async update(id: number, data: Partial<IGasto>) {
    const existe = await GastoModel.findById(id);
    if (!existe) throw new Error('Gasto no encontrado');
    await GastoModel.update(id, data);
    return { mensaje: 'Gasto actualizado correctamente' };
  }

  static async delete(id: number) {
    const existe = await GastoModel.findById(id);
    if (!existe) throw new Error('Gasto no encontrado');
    await GastoModel.delete(id);
    return { mensaje: 'Gasto eliminado correctamente' };
  }
  static async getEstadisticas(filtros?: { desde?: string; hasta?: string }) {
  return await GastoModel.getEstadisticas(filtros);
}
}