import { Router } from 'express';
import { StatsController } from '../controllers/stats.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

router.get('/barbero', verificarToken, verificarRol('barbero'), StatsController.getStatsBarbero);

export default router;