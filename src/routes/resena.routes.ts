import { Router } from 'express';
import { ResenaController } from '../controllers/resena.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

// Públicas
router.get('/barbero/:id', ResenaController.getByBarbero);

// Admin
router.get('/', verificarToken, verificarRol('admin'), ResenaController.getAll);

// Cliente autenticado
router.post('/', verificarToken, verificarRol('cliente'), ResenaController.create);

export default router;