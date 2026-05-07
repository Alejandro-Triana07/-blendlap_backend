import { Request, Response } from 'express';
import { ResenaService } from '../services/resena.service';

export class ResenaController {

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const resenas = await ResenaService.getAll();
      res.status(200).json({ ok: true, data: resenas });
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  static async getByBarbero(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const resenas = await ResenaService.getByBarbero(id);
      res.status(200).json({ ok: true, data: resenas });
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const id_cliente = req.usuario!.id_usuario;
      const resultado = await ResenaService.create({ ...req.body, id_cliente });
      res.status(201).json({ ok: true, ...resultado });
    } catch (error: any) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }
}