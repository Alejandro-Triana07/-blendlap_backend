import { Router } from 'express';
import { ReservaController } from '../controllers/reserva.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', verificarToken, verificarRol('admin'), ReservaController.getAll);
router.get('/disponibilidad', verificarToken, ReservaController.getDisponibilidad);
router.get('/mis-reservas', verificarToken, verificarRol('cliente'), ReservaController.getMisReservas);
router.get('/mis-servicios', verificarToken, verificarRol('barbero'), ReservaController.getMisServicios);
router.get('/:id', verificarToken, verificarRol('admin', 'barbero'), ReservaController.getById);
router.post('/', verificarToken, verificarRol('admin', 'cliente'), ReservaController.create);
router.put('/:id', verificarToken, ReservaController.update);
router.delete('/:id', verificarToken, verificarRol('admin'), ReservaController.delete);

export default router;