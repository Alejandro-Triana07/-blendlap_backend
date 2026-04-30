import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { verificarToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/registro', AuthController.registro);
router.get('/perfil', verificarToken, AuthController.perfil);
router.put('/cambiar-password', AuthController.cambiarPassword);
router.post('/solicitar-recuperacion', AuthController.solicitarRecuperacion);
router.post('/resetear-password', AuthController.resetearPassword);
export default router;