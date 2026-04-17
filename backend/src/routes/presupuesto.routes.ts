import { Router } from 'express';
import { getPresupuesto, upsertPresupuesto } from '../controllers/presupuesto.controller';

const router = Router();
router.get('/', getPresupuesto);
router.post('/', upsertPresupuesto);

export default router;