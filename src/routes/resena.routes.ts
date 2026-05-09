import { Router } from 'express';
import { ResenaController } from '../controllers/resena.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

router.get('/barbero/:id', ResenaController.getByBarbero);
router.post('/', verificarToken, verificarRol('cliente'), ResenaController.create);

export default router;