import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import productosRoutes from './routes/productos.routes';
import presupuestoRoutes from './routes/presupuesto.routes';
import gastosRoutes from './routes/gastos.routes';
import authRoutes from './routes/auth.routes';
import historialRoutes from './routes/historial.routes';
import perfilRoutes from './routes/perfil.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// fotos de perfil
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (_req, res) => { res.json({ status: 'ok' }); });
app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/presupuesto', presupuestoRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/perfil', perfilRoutes);

app.listen(PORT, () => {
  console.log(` Backend corriendo en http://localhost:${PORT}`);
});