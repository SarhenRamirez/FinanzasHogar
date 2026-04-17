import { Request, Response } from 'express';
import { pool } from '../db/pool';

export const getGastos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mes, anio } = req.query;
    let query = 'SELECT * FROM gastos';
    const params: any[] = [];
    if (mes && anio) {
      query += ' WHERE EXTRACT(MONTH FROM fecha)=$1 AND EXTRACT(YEAR FROM fecha)=$2';
      params.push(mes, anio);
    }
    query += ' ORDER BY fecha DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

export const createGasto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { descripcion, monto, categoria, fecha } = req.body;
    const result = await pool.query(
      `INSERT INTO gastos (descripcion, monto, categoria, fecha)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [descripcion, monto, categoria, fecha || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al crear gasto' });
  }
};

export const deleteGasto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gastos WHERE id=$1', [id]);
    res.json({ message: 'Gasto eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};