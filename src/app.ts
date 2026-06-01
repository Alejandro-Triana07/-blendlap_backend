import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import express, { Application } from 'express';
import cors from 'cors';
import { testConnection } from './database/connection';
import { iniciarCronJobs } from './utils/cron';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import servicioRoutes from './routes/servicio.routes';
import reservaRoutes from './routes/reserva.routes';
import chatRoutes from './routes/chat.routes';
import usuarioRoutes from './routes/usuario.routes';
import clienteRoutes from './routes/cliente.routes';
import turnoRoutes from './routes/turno.routes';
import productoRoutes from './routes/producto.routes';
import ventaRoutes from './routes/venta.routes';
import reporteRoutes from './routes/reporte.routes';
import path from 'path';
import resenaRoutes from './routes/resena.routes';
import dashboardRoutes from './routes/dashboard.routes';
import gastoRoutes from './routes/gasto.routes';
import horarioRoutes from './routes/horario.routes';
import statsRoutes from './routes/stats.routes';
import creditoRoutes from './routes/credito.routes';
import pagoRoutes from './routes/pago.routes';
import { PagoModel } from './models/pago.model';
import { EmailService } from './services/email.service';

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/servicios', servicioRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use('/api/resenas', resenaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/horarios', horarioRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/creditos', creditoRoutes);
app.use('/api/pagos', pagoRoutes);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health/email', async (_req, res) => {
  const configured = EmailService.isConfigured();
  const verified = configured ? await EmailService.verify() : false;
  res.json({
    configured,
    verified,
    from: process.env.EMAIL_FROM || null,
    user: process.env.EMAIL_USER ? 'set' : 'missing',
  });
});

app.post('/api/health/test-email', async (req, res) => {
  try {
    const { to } = req.body as { to?: string };
    if (!to || typeof to !== 'string') {
      res.status(400).json({ ok: false, mensaje: 'to es requerido' });
      return;
    }
    await EmailService.enviarPrueba(to);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, mensaje: err?.message || 'Error enviando correo' });
  }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await testConnection();
  await PagoModel.inicializarTabla();
  iniciarCronJobs();
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`Ambiente: ${process.env.NODE_ENV}`);
  if (EmailService.isConfigured()) {
    await EmailService.verify();
  } else {
    logger.warn(
      'Correo: NO configurado — registro y recuperación fallarán hasta definir EMAIL_USER y EMAIL_PASS en .env'
    );
  }
});

export default app;