import { Router } from 'express';
import { ReporteController } from '../controllers/reporte.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

router.get('/diario', verificarToken, verificarRol('admin'), ReporteController.getDiario);
router.get('/periodo', verificarToken, verificarRol('admin'), ReporteController.getPeriodo);
router.get('/estadisticas', verificarToken, verificarRol('admin'), ReporteController.getEstadisticas);
router.get('/pdf', verificarToken, verificarRol('admin'), ReporteController.exportarPDF);

export default router;