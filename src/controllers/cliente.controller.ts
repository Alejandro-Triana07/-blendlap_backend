import { Request, Response } from 'express';
import { ClienteService } from '../services/cliente.service';

export class ClienteController {

  // GET /api/clientes
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const clientes = await ClienteService.getAll();
      res.status(200).json({ ok: true, data: clientes });
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  // GET /api/clientes/buscar?termino=xxx
  static async buscar(req: Request, res: Response): Promise<void> {
    try {
      const termino = req.query.termino as string;
      const clientes = await ClienteService.buscar(termino);
      res.status(200).json({ ok: true, data: clientes });
    } catch (error: any) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  // GET /api/clientes/:id/historial
  static async getHistorial(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const historial = await ClienteService.getHistorial(id);
      res.status(200).json({ ok: true, data: historial });
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  // POST /api/clientes/:id/corte
  static async registrarCorte(req: Request, res: Response): Promise<void> {
    try {
      const id_cliente = parseInt(req.params.id);
      const id_barbero = req.usuario!.id_usuario;
      const resultado = await ClienteService.registrarCorte(id_cliente, id_barbero);
      res.status(201).json({ ok: true, ...resultado });
    } catch (error: any) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }

  // PUT /api/clientes/:id
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const resultado = await ClienteService.update(id, req.body);
      res.status(200).json({ ok: true, ...resultado });
    } catch (error: any) {
      res.status(400).json({ ok: false, mensaje: error.message });
    }
  }
}