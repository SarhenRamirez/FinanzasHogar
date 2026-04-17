import { Request, Response } from 'express';
import { pool } from '../db/pool';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET no definido';

const getUsuarioId = (req: Request): number | null => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
};

export const getPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUsuarioId(req);
    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    const result = await pool.query(
      'SELECT id, nombre, email, telefono, foto_url, creado_en FROM usuarios WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

export const updatePerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUsuarioId(req);
    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    const { nombre, telefono } = req.body;
    if (!nombre) { res.status(400).json({ error: 'El nombre es requerido' }); return; }

    const result = await pool.query(
      `UPDATE usuarios SET nombre=$1, telefono=$2, actualizado_en=NOW()
       WHERE id=$3 RETURNING id, nombre, email, telefono, foto_url`,
      [nombre, telefono || null, userId]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUsuarioId(req);
    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }

    const { password_actual, password_nuevo } = req.body;
    if (!password_actual || !password_nuevo) {
      res.status(400).json({ error: 'Todos los campos son requeridos' }); return;
    }
    if (password_nuevo.length < 6) {
      res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' }); return;
    }

    const user = await pool.query('SELECT password_hash FROM usuarios WHERE id=$1', [userId]);
    const valido = await bcrypt.compare(password_actual, user.rows[0].password_hash);
    if (!valido) { res.status(400).json({ error: 'La contraseña actual es incorrecta' }); return; }

    const hash = await bcrypt.hash(password_nuevo, 12);
    await pool.query('UPDATE usuarios SET password_hash=$1, actualizado_en=NOW() WHERE id=$2', [hash, userId]);
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
};

export const uploadFoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUsuarioId(req);
    if (!userId) { res.status(401).json({ error: 'No autorizado' }); return; }
    if (!req.file) { res.status(400).json({ error: 'No se subió ninguna imagen' }); return; }

    // Eliminar foto anterior si existe
    const prev = await pool.query('SELECT foto_url FROM usuarios WHERE id=$1', [userId]);
    if (prev.rows[0]?.foto_url) {
      const prevPath = path.join(__dirname, '../../uploads', path.basename(prev.rows[0].foto_url));
      if (fs.existsSync(prevPath)) fs.unlinkSync(prevPath);
    }

    const fotoUrl = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      'UPDATE usuarios SET foto_url=$1, actualizado_en=NOW() WHERE id=$2 RETURNING foto_url',
      [fotoUrl, userId]
    );
    res.json({ foto_url: result.rows[0].foto_url });
  } catch {
    res.status(500).json({ error: 'Error al subir foto' });
  }
};