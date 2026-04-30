import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

// Ver todos los clientes (admin)
router.get('/', verificarToken, verificarRol('admin'), ClienteController.getAll);

// Buscar clientes (admin y barbero)
router.get('/buscar', verificarToken, verificarRol('admin', 'barbero'), ClienteController.buscar);

// Historial del cliente (admin y barbero)
router.get('/:id/historial', verificarToken, verificarRol('admin', 'barbero'), ClienteController.getHistorial);

// Registrar corte presencial (barbero y admin)
router.post('/:id/corte', verificarToken, verificarRol('admin', 'barbero'), ClienteController.registrarCorte);

// Actualizar datos del cliente (admin)
router.put('/:id', verificarToken, verificarRol('admin'), ClienteController.update);

export default router;