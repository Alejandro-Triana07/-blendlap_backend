import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario.service';

export class UsuarioController {

  // GET /api/usuarios
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const usuarios = await UsuarioService.getAll();
      res.status(200).json({ ok: true, data: usuarios });
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  // PUT /api/usuarios/:id/rol
  static async cambiarRol(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { rol } = req.body;
      if (!rol) {
        res.status(400).json({ ok: false, mensaje: 'El rol es requerido' });
        return;
      }
      const resultado = await UsuarioService.cambiarRol(id, rol);
      res.status(200).json({ ok: true, ...resultado });
    } catch (error: any) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  // PUT /api/usuarios/:id/estado
  static async cambiarEstado(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { estado } = req.body;
      if (!estado) {
        res.status(400).json({ ok: false, mensaje: 'El estado es requerido' });
        return;
      }
      const resultado = await UsuarioService.cambiarEstado(id, estado);
      res.status(200).json({ ok: true, ...resultado });
    } catch (error: any) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }
}