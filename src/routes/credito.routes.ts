import { Router } from 'express';
import { CreditoController } from '../controllers/credito.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

// Cliente
router.get('/mis-creditos', verificarToken, CreditoController.getMisCreditos);
router.post('/solicitar',   verificarToken, verificarRol('cliente'), CreditoController.solicitarCliente);

// Admin
router.get('/',             verificarToken, verificarRol('admin'), CreditoController.getAll);
router.get('/:id',          verificarToken, verificarRol('admin'), CreditoController.getById);
router.post('/admin',       verificarToken, verificarRol('admin'), CreditoController.crearAdmin);
router.put('/:id/aprobar',  verificarToken, verificarRol('admin'), CreditoController.aprobar);
router.put('/:id/rechazar', verificarToken, verificarRol('admin'), CreditoController.rechazar);
router.post('/abonar',      verificarToken, verificarRol('admin'), CreditoController.abonar);

export default router;