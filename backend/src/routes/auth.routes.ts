import { Router } from 'express';
import { registro, login, logout, perfil } from '../controllers/auth.controller';

const router = Router();

router.post('/registro', registro);
router.post('/login', login);
router.post('/logout', logout);
router.get('/perfil', perfil);

export default router;