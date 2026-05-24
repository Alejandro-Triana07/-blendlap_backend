import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller';
import { verificarToken, verificarRol } from '../middlewares/auth.middleware';
import { uploadProducto } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', ProductoController.getAll);
router.get('/stock', verificarToken, ProductoController.getStockActual);
router.get('/stock-bajo', verificarToken, verificarRol('admin'), ProductoController.getStockBajo);
router.post('/movimiento', verificarToken, verificarRol('admin'), ProductoController.registrarMovimiento);
router.get('/:id/movimientos', verificarToken, verificarRol('admin'), ProductoController.getMovimientos);
router.get('/:id', verificarToken, ProductoController.getById);
router.post('/', verificarToken, verificarRol('admin'), uploadProducto.single('imagen'), ProductoController.create);
router.put('/:id', verificarToken, verificarRol('admin'), uploadProducto.single('imagen'), ProductoController.update);
router.delete('/:id', verificarToken, verificarRol('admin'), ProductoController.delete);

export default router;