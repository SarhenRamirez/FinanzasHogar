import { Router } from 'express';
import {
  getProductos,
  getAgotados,
  getResumen,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../controllers/productos.controller';

const router = Router();

router.get('/', getProductos);
router.get('/agotados', getAgotados);
router.get('/resumen', getResumen);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

export default router;