import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

router.get('/admin', verificarToken, verificarRol('admin'), DashboardController.getResumen);

export default router;