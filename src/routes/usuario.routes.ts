import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { HistorialModel } from '../models/historial.model';

const router = Router();

// Solo admin puede gestionar usuarios
router.get('/', verificarToken, verificarRol('admin'), UsuarioController.getAll);
router.put('/:id/rol', verificarToken, verificarRol('admin'), UsuarioController.cambiarRol);
router.put('/:id/estado', verificarToken, verificarRol('admin'), UsuarioController.cambiarEstado);

// GET /api/usuarios/historial
router.get('/historial', verificarToken, verificarRol('admin'), async (req, res) => {
  try {
    const historial = await HistorialModel.findAll();
    res.status(200).json({ ok: true, data: historial });
  } catch (error: any) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
})

export default router;