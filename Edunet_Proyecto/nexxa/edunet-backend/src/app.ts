import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRoutes from './routes/users';
import authRoutes from './routes/auth';
import profesorRoutes from './routes/profesor';
import cursosRoutes from './routes/cursos';
import cursosEstudianteRoutes from './routes/cursos-estudiante';
import calificacionesRoutes from './routes/calificaciones';
import asistenciaRoutes from './routes/asistencia';
import reportesRoutes from './routes/reportes';
import clasesRoutes from './routes/clases';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger (no external dependency) — muestra método, ruta y timestamp
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profesor', profesorRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/estudiante/cursos', cursosEstudianteRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/clases', clasesRoutes);

// Ruta raíz: información básica de la API
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'Edunet API - backend',
    info: 'Las rutas principales están bajo /api',
    endpoints: [
      '/api',
      '/api/users',
      '/api/auth',
      '/api/profesor',
      '/api/cursos',
      '/api/calificaciones',
      '/api/asistencia',
      '/api/reportes',
      '/api/clases'
    ]
  });
});

// Responde a la ruta /api con información y enlaces básicos
app.get('/api', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'Edunet API - raíz de API',
    available: {
      auth: '/api/auth',
      users: '/api/users',
      profesor: '/api/profesor',
      cursos: '/api/cursos',
      calificaciones: '/api/calificaciones',
      asistencia: '/api/asistencia',
      reportes: '/api/reportes',
      clases: '/api/clases'
    }
  });
});

// Manejo de errores 404
// Manejo de rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    details: `La ruta ${req.originalUrl} no está definida en el servidor.`
  });
});

// Configuración del puerto y arranque del servidor
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

export default app;