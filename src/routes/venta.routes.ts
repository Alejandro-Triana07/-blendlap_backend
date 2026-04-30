import { Router } from 'express';
import { VentaController } from '../controllers/venta.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verificarToken, verificarRol('admin'), VentaController.getAll);
router.get('/cierre-caja', verificarToken, verificarRol('admin'), VentaController.cierreCaja);
router.get('/:id', verificarToken, verificarRol('admin'), VentaController.getById);
router.post('/', verificarToken, verificarRol('admin', 'barbero'), VentaController.create);

export default router;