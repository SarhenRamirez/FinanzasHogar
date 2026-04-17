import { Request, Response } from 'express';
import { pool } from '../db/pool';

export const getHistorial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { producto_id, limite = 50 } = req.query;
    let query = `
      SELECT h.*, p.nombre as producto_nombre_actual
      FROM historial h
      LEFT JOIN productos p ON h.producto_id = p.id
    `;
    const params: any[] = [];

    if (producto_id) {
      query += ' WHERE h.producto_id = $1';
      params.push(producto_id);
    }

    query += ` ORDER BY h.creado_en DESC LIMIT $${params.length + 1}`;
    params.push(limite);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

export const registrarCambio = async (
  productoId: number,
  productoNombre: string,
  campoModificado: string,
  valorAnterior: string,
  valorNuevo: string,
  usuarioId?: number,
  usuarioNombre?: string
) => {
  try {
    await pool.query(
      `INSERT INTO historial
        (producto_id, producto_nombre, campo_modificado, valor_anterior, valor_nuevo, usuario_id, usuario_nombre)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [productoId, productoNombre, campoModificado, valorAnterior, valorNuevo, usuarioId, usuarioNombre]
    );
  } catch (err) {
    console.error('Error registrando historial:', err);
  }
};