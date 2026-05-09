import { Request, Response } from 'express';
import { GastoService } from '../services/gasto.service';

export class GastoController {

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { desde, hasta, categoria } = req.query;
      const gastos = await GastoService.getAll({ desde, hasta, categoria });
      res.status(200).json({ ok: true, data: gastos });
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const resultado = await GastoService.create(req.body);
      res.status(201).json({ ok: true, ...resultado });
    } catch (error: any) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const resultado = await GastoService.update(id, req.body);
      res.status(200).json({ ok: true, ...resultado });
    } catch (error: any) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const resultado = await GastoService.delete(id);
      res.status(200).json({ ok: true, ...resultado });
    } catch (error: any) {
      res.status(404).json({ ok: false, mensaje: error.message });
    }
  }
}