"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("./routes/users"));
const auth_1 = __importDefault(require("./routes/auth"));
const profesor_1 = __importDefault(require("./routes/profesor"));
const cursos_1 = __importDefault(require("./routes/cursos"));
const cursos_estudiante_1 = __importDefault(require("./routes/cursos-estudiante"));
const calificaciones_1 = __importDefault(require("./routes/calificaciones"));
const asistencia_1 = __importDefault(require("./routes/asistencia"));
const reportes_1 = __importDefault(require("./routes/reportes"));
const clases_1 = __importDefault(require("./routes/clases"));
const mensajes_1 = __importDefault(require("./routes/mensajes"));
const materiales_1 = __importDefault(require("./routes/materiales"));
const eventos_1 = __importDefault(require("./routes/eventos"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Simple request logger (no external dependency) — muestra método, ruta y timestamp
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
});
// Rutas
app.use('/api/users', users_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/profesor', profesor_1.default);
app.use('/api/cursos', cursos_1.default);
app.use('/api/estudiante/cursos', cursos_estudiante_1.default);
app.use('/api/calificaciones', calificaciones_1.default);
app.use('/api/asistencia', asistencia_1.default);
app.use('/api/reportes', reportes_1.default);
app.use('/api/clases', clases_1.default);
app.use('/api/mensajes', mensajes_1.default);
app.use('/api/materiales', materiales_1.default);
app.use('/api/eventos', eventos_1.default);
// Ruta raíz: información básica de la API
app.get('/', (req, res) => {
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
app.get('/api', (req, res) => {
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
app.use((req, res) => {
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
exports.default = app;
