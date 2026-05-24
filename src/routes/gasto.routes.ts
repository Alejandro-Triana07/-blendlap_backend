import { Router } from 'express';
import { GastoController } from '../controllers/gasto.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verificarToken, verificarRol('admin'), GastoController.getAll);
router.post('/', verificarToken, verificarRol('admin'), GastoController.create);
router.put('/:id', verificarToken, verificarRol('admin'), GastoController.update);
router.delete('/:id', verificarToken, verificarRol('admin'), GastoController.delete);
router.get('/estadisticas', verificarToken, verificarRol('admin'), GastoController.getEstadisticas);

export default router;