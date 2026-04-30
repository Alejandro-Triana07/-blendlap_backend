import { Router } from 'express';
import { ServicioController } from '../controllers/servicio.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas (cualquiera autenticado puede ver servicios)
router.get('/', verificarToken, ServicioController.getAll);
router.get('/:id', verificarToken, ServicioController.getById);

// Rutas solo admin
router.post('/', verificarToken, verificarRol('admin'), ServicioController.create);
router.put('/:id', verificarToken, verificarRol('admin'), ServicioController.update);
router.delete('/:id', verificarToken, verificarRol('admin'), ServicioController.delete);

export default router;