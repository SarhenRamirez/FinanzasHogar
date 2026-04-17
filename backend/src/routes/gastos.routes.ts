import { Router } from 'express';
import { getGastos, createGasto, deleteGasto } from '../controllers/gastos.controller';

const router = Router();
router.get('/', getGastos);
router.post('/', createGasto);
router.delete('/:id', deleteGasto);

export default router;