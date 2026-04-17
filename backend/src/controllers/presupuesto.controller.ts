import { Request, Response } from 'express';
import { pool } from '../db/pool';

export const getPresupuesto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mes, anio } = req.query;
    const result = await pool.query(
      'SELECT * FROM presupuesto WHERE mes=$1 AND anio=$2',
      [mes, anio]
    );
    res.json(result.rows[0] || { monto: 0 });
  } catch {
    res.status(500).json({ error: 'Error al obtener presupuesto' });
  }
};

export const upsertPresupuesto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mes, anio, monto } = req.body;
    const result = await pool.query(
      `INSERT INTO presupuesto (mes, anio, monto)
       VALUES ($1, $2, $3)
       ON CONFLICT (mes, anio) DO UPDATE SET monto = $3
       RETURNING *`,
      [mes, anio, monto]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al guardar presupuesto' });
  }
};