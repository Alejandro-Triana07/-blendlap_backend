import { Request, Response } from 'express';
import { ReservaService } from '../services/reserva.service';
import { ReservaModel } from '../models/reserva.model';

export class ReservaController {

    // GET /api/reservas → solo admin
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { fecha, id_barbero, estado } = req.query;
            const reservas = await ReservaService.getAll({
                fecha: fecha as string,
                id_barbero: id_barbero as string,
                estado: estado as string
            });
            res.status(200).json({ ok: true, data: reservas });
        } catch (error: any) {
            res.status(500).json({ ok: false, mensaje: error.message });
        }
    }

    // GET /api/reservas/:id
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const reserva = await ReservaService.getById(id);
            res.status(200).json({ ok: true, data: reserva });
        } catch (error: any) {
            res.status(404).json({ ok: false, mensaje: error.message });
        }
    }

    // GET /api/reservas/mis-reservas → cliente ve sus reservas
    static async getMisReservas(req: Request, res: Response): Promise<void> {
        try {
            const id_cliente = req.usuario!.id_usuario;
            const reservas = await ReservaService.getMisReservas(id_cliente);
            res.status(200).json({ ok: true, data: reservas });
        } catch (error: any) {
            res.status(500).json({ ok: false, mensaje: error.message });
        }
    }

    // GET /api/reservas/mis-servicios → barbero ve sus reservas
    static async getMisServicios(req: Request, res: Response): Promise<void> {
        try {
            const id_barbero = req.usuario!.id_usuario;
            const reservas = await ReservaService.getMisServicios(id_barbero);
            res.status(200).json({ ok: true, data: reservas });
        } catch (error: any) {
            res.status(500).json({ ok: false, mensaje: error.message });
        }
    }

    // POST /api/reservas
    static async create(req: Request, res: Response): Promise<void> {
        try {
            const reserva = await ReservaService.create(req.body);
            res.status(201).json({ ok: true, data: reserva });
        } catch (error: any) {
            res.status(400).json({ ok: false, mensaje: error.message });
        }
    }

    // PUT /api/reservas/:id
    static async update(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const { rol, id_usuario } = req.usuario!;
            const reserva = await ReservaService.update(id, req.body, rol, id_usuario);
            res.status(200).json({ ok: true, data: reserva });
        } catch (error: any) {
            res.status(400).json({ ok: false, mensaje: error.message });
        }
    }

    // DELETE /api/reservas/:id → solo admin
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = parseInt(req.params.id);
            const resultado = await ReservaService.delete(id);
            res.status(200).json({ ok: true, ...resultado });
        } catch (error: any) {
            res.status(404).json({ ok: false, mensaje: error.message });
        }
    }
    // GET /api/reservas/disponibilidad?id_barbero=2&fecha=2025-06-01
    static async getDisponibilidad(req: Request, res: Response): Promise<void> {
        try {
            const id_barbero = parseInt(req.query.id_barbero as string);
            const fecha = req.query.fecha as string;
            const duracion_total = parseInt(req.query.duracion_total as string) || 30;
            const resultado = await ReservaService.getDisponibilidad(id_barbero, fecha, duracion_total);
            res.status(200).json({ ok: true, data: resultado });
        } catch (error: any) {
            res.status(400).json({ ok: false, mensaje: error.message });
        }
    }
    static async getCitasHoy(req: Request, res: Response): Promise<void> {
  try {
    const id_barbero = req.usuario!.id_usuario;
    const hoy = new Date().toISOString().split('T')[0];
    const reservas = await ReservaModel.findByBarberoFecha(id_barbero, hoy);
    res.status(200).json({ ok: true, data: reservas });
  } catch (error: any) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
}

static async getProximas(req: Request, res: Response): Promise<void> {
  try {
    const id_barbero = req.usuario!.id_usuario;
    const hoy = new Date().toISOString().split('T')[0];
    const reservas = await ReservaModel.findProximasBarbero(id_barbero, hoy);
    res.status(200).json({ ok: true, data: reservas });
  } catch (error: any) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
}
}