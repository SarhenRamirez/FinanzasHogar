import { Router } from 'express';
import { getHistorial } from '../controllers/historial.controller';

const router = Router();
router.get('/', getHistorial);

export default router;