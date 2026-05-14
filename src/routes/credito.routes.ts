import { Router } from 'express';
import { CreditoController } from '../controllers/credito.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

// Admin
router.get('/',             verificarToken, verificarRol('admin'), CreditoController.getAll);
router.get('/:id',          verificarToken, verificarRol('admin'), CreditoController.getById);
router.post('/admin',       verificarToken, verificarRol('admin'), CreditoController.crearAdmin);
router.put('/:id/aprobar',  verificarToken, verificarRol('admin'), CreditoController.aprobar);
router.put('/:id/rechazar', verificarToken, verificarRol('admin'), CreditoController.rechazar);
router.post('/abonar',      verificarToken, verificarRol('admin'), CreditoController.abonar);

// Cliente desde home
router.post('/solicitar',   verificarToken, verificarRol('cliente'), CreditoController.solicitarCliente);

export default router;