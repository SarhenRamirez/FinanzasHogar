import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { CreateProductoDTO } from '../types';
import { registrarCambio } from './historial.controller';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'JWT_SECRET no definido';

const getUsuarioDelToken = (req: Request) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return { id: undefined, nombre: 'Sistema' };
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; nombre?: string };
    return { id: decoded.id, nombre: decoded.nombre || decoded.email };
  } catch {
    return { id: undefined, nombre: 'Sistema' };
  }
};

export const getProductos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY categoria, nombre ASC');
    res.json(result.rows);
  } catch (error) {
  console.error(" ERROR EN getProductos:", error);
  res.status(500).json({ error: 'Error al obtener productos' });
}
};

export const getAgotados = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM productos WHERE cantidad <= cantidad_minima ORDER BY categoria ASC'
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Error al obtener agotados' });
  }
};

export const getResumen = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalResult = await pool.query(
      'SELECT COALESCE(SUM(precio * cantidad), 0) AS total FROM productos'
    );
    const agotadosResult = await pool.query(
      'SELECT COALESCE(SUM(precio), 0) AS total FROM productos WHERE cantidad <= cantidad_minima'
    );
    res.json({
      total_inventario: parseFloat(totalResult.rows[0].total),
      total_agotados: parseFloat(agotadosResult.rows[0].total),
    });
  } catch {
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};

export const createProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, categoria, precio, cantidad, cantidad_minima, unidad }: CreateProductoDTO = req.body;

    if (!nombre || !categoria || precio === undefined || cantidad === undefined) {
      res.status(400).json({ error: 'Faltan campos requeridos' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO productos (nombre, categoria, precio, cantidad, cantidad_minima, unidad)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nombre, categoria, Number(precio), Number(cantidad), Number(cantidad_minima), unidad || 'unidad']
    );

    const producto = result.rows[0];
    const usuario = getUsuarioDelToken(req);

    await registrarCambio(
      producto.id, nombre, 'creación',
      '-', `Producto creado: ${nombre} (${categoria})`,
      usuario.id, usuario.nombre
    );

    res.status(201).json(producto);
  } catch {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const updateProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, categoria, precio, cantidad, cantidad_minima, unidad }: CreateProductoDTO = req.body;

    const anterior = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (anterior.rows.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const prev = anterior.rows[0];
    const usuario = getUsuarioDelToken(req);

    const result = await pool.query(
      `UPDATE productos
       SET nombre=$1, categoria=$2, precio=$3, cantidad=$4, cantidad_minima=$5, unidad=$6
       WHERE id=$7 RETURNING *`,
      [nombre, categoria, Number(precio), Number(cantidad), Number(cantidad_minima), unidad, id]
    );

    // Registrar cada campo que cambió
    const campos: { campo: string; anterior: any; nuevo: any }[] = [
      { campo: 'nombre', anterior: prev.nombre, nuevo: nombre },
      { campo: 'precio', anterior: prev.precio, nuevo: Number(precio) },
      { campo: 'cantidad', anterior: prev.cantidad, nuevo: Number(cantidad) },
      { campo: 'cantidad_minima', anterior: prev.cantidad_minima, nuevo: Number(cantidad_minima) },
      { campo: 'categoria', anterior: prev.categoria, nuevo: categoria },
      { campo: 'unidad', anterior: prev.unidad, nuevo: unidad },
    ];

    for (const c of campos) {
      if (String(c.anterior) !== String(c.nuevo)) {
        await registrarCambio(
          Number(id), nombre, c.campo,
          String(c.anterior), String(c.nuevo),
          usuario.id, usuario.nombre
        );
      }
    }

    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

export const deleteProducto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const prev = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (prev.rows.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const usuario = getUsuarioDelToken(req);
    await registrarCambio(
      Number(id), prev.rows[0].nombre, 'eliminación',
      prev.rows[0].nombre, 'Producto eliminado',
      usuario.id, usuario.nombre
    );

    await pool.query('DELETE FROM productos WHERE id=$1', [id]);
    res.json({ message: 'Producto eliminado', id });
  } catch {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};