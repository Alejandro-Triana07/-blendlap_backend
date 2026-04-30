import { AuthModel } from '../models/auth.model';

export class UsuarioService {

  // Obtener todos los usuarios
  static async getAll() {
    return await AuthModel.findAll();
  }

  // Cambiar rol
  static async cambiarRol(id_usuario: number, rol: string) {
    const rolesValidos = ['admin', 'barbero', 'cliente'];
    if (!rolesValidos.includes(rol)) {
      throw new Error('Rol inválido');
    }

    const usuario = await AuthModel.findById(id_usuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    await AuthModel.cambiarRol(id_usuario, rol);
    return { mensaje: `Rol actualizado a ${rol} correctamente` };
  }

  // Cambiar estado
  static async cambiarEstado(id_usuario: number, estado: string) {
    const estadosValidos = ['activo', 'inactivo'];
    if (!estadosValidos.includes(estado)) {
      throw new Error('Estado inválido');
    }

    const usuario = await AuthModel.findById(id_usuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    await AuthModel.cambiarEstado(id_usuario, estado);
    return { mensaje: `Estado actualizado a ${estado} correctamente` };
  }
}