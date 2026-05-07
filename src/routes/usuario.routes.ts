import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { uploadBarbero } from '../middlewares/upload.middleware';
import { HistorialModel } from '../models/historial.model';

const router = Router();

// Pública
router.get('/barberos', UsuarioController.getBarberos);

// Rutas específicas ANTES de las rutas con parámetros
router.get('/barberos/todos', verificarToken, verificarRol('admin'), UsuarioController.getAllBarberos);
router.post('/barberos/upload-foto', verificarToken, verificarRol('admin'), uploadBarbero.single('foto'), UsuarioController.uploadFotoBarbero);
router.post('/barberos', verificarToken, verificarRol('admin'), UsuarioController.crearBarbero);

// Rutas con parámetros DESPUÉS
router.put('/barberos/:id/reactivar', verificarToken, verificarRol('admin'), UsuarioController.reactivarBarbero);
router.put('/barberos/:id', verificarToken, verificarRol('admin'), UsuarioController.actualizarBarbero);
router.delete('/barberos/:id', verificarToken, verificarRol('admin'), UsuarioController.eliminarBarbero);

// Admin general
router.get('/', verificarToken, verificarRol('admin'), UsuarioController.getAll);
router.put('/:id/rol', verificarToken, verificarRol('admin'), UsuarioController.cambiarRol);
router.put('/:id/estado', verificarToken, verificarRol('admin'), UsuarioController.cambiarEstado);

// Historial
router.get('/historial', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const historial = await HistorialModel.findAll();
    res.status(200).json({ ok: true, data: historial });
  } catch (error: any) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
});

export default router;