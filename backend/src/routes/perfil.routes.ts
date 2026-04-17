import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getPerfil, updatePerfil, updatePassword, uploadFoto } from '../controllers/perfil.controller';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `foto-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
  },
});

const router = Router();
router.get('/', getPerfil);
router.put('/', updatePerfil);
router.put('/password', updatePassword);
router.post('/foto', upload.single('foto'), uploadFoto);

export default router;