import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto';
const JWT_EXPIRES = '7d';

export const registro = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      res.status(400).json({ error: 'Todos los campos son requeridos' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, nombre, email`,
      [nombre, email, hash]
    );

    const usuario = result.rows[0];
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    await pool.query(
      `INSERT INTO sesiones (usuario_id, token, expira_en)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [usuario.id, token]
    );

    res.status(201).json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    const usuario = result.rows[0];
    const valido = await bcrypt.compare(password, usuario.password_hash);

    if (!valido) {
      res.status(401).json({ error: 'Credenciales incorrectas' });
      return;
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    await pool.query(
      `INSERT INTO sesiones (usuario_id, token, expira_en)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [usuario.id, token]
    );

    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await pool.query('DELETE FROM sesiones WHERE token = $1', [token]);
    }
    res.json({ message: 'Sesión cerrada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
};

export const perfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const result = await pool.query(
      'SELECT id, nombre, email, creado_en FROM usuarios WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(result.rows[0]);
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};