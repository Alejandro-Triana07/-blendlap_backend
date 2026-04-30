import { Request, Response } from 'express';
import { ReservaService } from '../services/reserva.service';

export class ReservaController {

    // GET /api/reservas → solo admin
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const reservas = await ReservaService.getAll();
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
            const resultado = await ReservaService.getDisponibilidad(id_barbero, fecha);
            res.status(200).json({ ok: true, data: resultado });
        } catch (error: any) {
            res.status(400).json({ ok: false, mensaje: error.message });
        }
    }
}