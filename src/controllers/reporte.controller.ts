import { Request, Response } from 'express';
import { ReporteService } from '../services/reporte.service';

export class ReporteController {

  // GET /api/reportes/diario?fecha=2026-04-29
  static async getDiario(req: Request, res: Response): Promise<void> {
    try {
      const fecha = req.query.fecha as string || new Date().toISOString().split('T')[0];
      const reporte = await ReporteService.getReporteDiario(fecha, req.usuario!.id_usuario);
      res.status(200).json({ ok: true, data: reporte });
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  // GET /api/reportes/periodo?fechaInicio=2026-04-01&fechaFin=2026-04-29
  static async getPeriodo(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin, id_barbero } = req.query;
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({ ok: false, mensaje: 'fechaInicio y fechaFin son requeridos' });
        return;
      }
      const reporte = await ReporteService.getReportePeriodo({
        fechaInicio: fechaInicio as string,
        fechaFin: fechaFin as string,
        id_barbero: id_barbero ? parseInt(id_barbero as string) : undefined
      }, req.usuario!.id_usuario);
      res.status(200).json({ ok: true, data: reporte });
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  // GET /api/reportes/estadisticas?fechaInicio=2026-04-01&fechaFin=2026-04-29
  static async getEstadisticas(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin } = req.query;
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({ ok: false, mensaje: 'fechaInicio y fechaFin son requeridos' });
        return;
      }
      const reporte = await ReporteService.getReportePeriodo({
        fechaInicio: fechaInicio as string,
        fechaFin: fechaFin as string
      }, req.usuario!.id_usuario);
      res.status(200).json({
        ok: true,
        data: {
          ventas_por_dia: reporte.ventas_por_dia,
          top_servicios: reporte.top_servicios,
          top_productos: reporte.top_productos,
          comisiones: reporte.comisiones
        }
      });
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }

  // GET /api/reportes/pdf?fechaInicio=2026-04-01&fechaFin=2026-04-29
  static async exportarPDF(req: Request, res: Response): Promise<void> {
    try {
      const { fechaInicio, fechaFin, id_barbero } = req.query;
      if (!fechaInicio || !fechaFin) {
        res.status(400).json({ ok: false, mensaje: 'fechaInicio y fechaFin son requeridos' });
        return;
      }
      await ReporteService.exportarPDF(res, {
        fechaInicio: fechaInicio as string,
        fechaFin: fechaFin as string,
        id_barbero: id_barbero ? parseInt(id_barbero as string) : undefined
      }, req.usuario!.id_usuario);
    } catch (error: any) {
      res.status(500).json({ ok: false, mensaje: error.message });
    }
  }
}