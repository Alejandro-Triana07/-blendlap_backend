import { Router } from 'express';
import { TurnoController } from '../controllers/turno.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';

const router = Router();

// Admin ve todos los turnos
router.get('/', verificarToken, verificarRol('admin'), TurnoController.getAll);

// Turnos por fecha (admin)
router.get('/fecha', verificarToken, verificarRol('admin'), TurnoController.getByFecha);

// Barbero ve sus turnos
router.get('/mis-turnos', verificarToken, verificarRol('barbero'), TurnoController.getMisTurnos);

// Rendimiento por barbero (admin)
router.get('/rendimiento', verificarToken, verificarRol('admin'), TurnoController.getRendimiento);

// Ver turno por ID
router.get('/:id', verificarToken, verificarRol('admin'), TurnoController.getById);

// Crear turno (admin)
router.post('/', verificarToken, verificarRol('admin'), TurnoController.create);

// Actualizar turno (admin)
router.put('/:id', verificarToken, verificarRol('admin'), TurnoController.update);

// Eliminar turno (admin)
router.delete('/:id', verificarToken, verificarRol('admin'), TurnoController.delete);

export default router;