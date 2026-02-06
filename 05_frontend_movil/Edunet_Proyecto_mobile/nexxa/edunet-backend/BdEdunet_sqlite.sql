
-- Enable Foreign Keys
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles(
  idRol INTEGER PRIMARY KEY AUTOINCREMENT,
  nombreRol TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
  idUsuarios INTEGER PRIMARY KEY AUTOINCREMENT,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  correo TEXT NOT NULL,
  documento INTEGER NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT NOT NULL,
  fotoPerfil TEXT NULL,
  password TEXT NOT NULL,
  grado TEXT,
  contacto_emergencia TEXT,
  telefono_contacto_emergencia TEXT,
  curso_asignado TEXT,
  nombre_estudiante_acargo TEXT,
  parentezco TEXT,
  cargo_admin TEXT,
  idRol INTEGER NOT NULL,
  is_rector INTEGER DEFAULT 0, -- Boolean as 0/1
  is_active INTEGER DEFAULT 1, -- Boolean as 0/1
  FOREIGN KEY (idRol) REFERENCES roles (idRol) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS correo_UNIQUE ON usuarios (correo ASC);
CREATE INDEX IF NOT EXISTS userRol_idx ON usuarios (idRol ASC);

-- Tabla de materias
CREATE TABLE IF NOT EXISTS materias (
  idMateria INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  codigo TEXT NOT NULL UNIQUE
);

-- Tabla de cursos (representa un grupo específico de una materia)
CREATE TABLE IF NOT EXISTS cursos (
  idCurso INTEGER PRIMARY KEY AUTOINCREMENT,
  idMateria INTEGER NOT NULL,
  idProfesor INTEGER NOT NULL,
  periodo TEXT NOT NULL,
  anio INTEGER NOT NULL,
  grado TEXT NOT NULL,
  seccion TEXT NOT NULL,
  FOREIGN KEY (idMateria) REFERENCES materias(idMateria),
  FOREIGN KEY (idProfesor) REFERENCES usuarios(idUsuarios)
);

-- Tabla de estudiantes por curso
CREATE TABLE IF NOT EXISTS curso_estudiante (
  idCurso INTEGER NOT NULL,
  idEstudiante INTEGER NOT NULL,
  fechaInscripcion TEXT NOT NULL, -- DATE as TEXT
  estado TEXT DEFAULT 'activo',
  PRIMARY KEY (idCurso, idEstudiante),
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso),
  FOREIGN KEY (idEstudiante) REFERENCES usuarios(idUsuarios)
);

-- Tabla de calificaciones
CREATE TABLE IF NOT EXISTS calificaciones (
  idCalificacion INTEGER PRIMARY KEY AUTOINCREMENT,
  idCurso INTEGER NOT NULL,
  idEstudiante INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- parcial, final, tarea, proyecto, etc.
  nombre TEXT NOT NULL,
  valor REAL NOT NULL, -- DECIMAL as REAL
  peso REAL NOT NULL, -- DECIMAL as REAL
  fecha_asignacion TEXT NOT NULL, -- DATE as TEXT
  fecha_entrega TEXT, -- DATE as TEXT
  comentarios TEXT,
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso),
  FOREIGN KEY (idEstudiante) REFERENCES usuarios(idUsuarios)
);

-- Tabla de clases (sesiones)
CREATE TABLE IF NOT EXISTS clases (
  idClase INTEGER PRIMARY KEY AUTOINCREMENT,
  idCurso INTEGER NOT NULL,
  fecha TEXT NOT NULL, -- DATE as TEXT
  hora_inicio TEXT NOT NULL, -- TIME as TEXT
  hora_fin TEXT NOT NULL, -- TIME as TEXT
  tema TEXT,
  descripcion TEXT,
  estado TEXT DEFAULT 'programada', -- programada, realizada, cancelada
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso)
);

-- Tabla de asistencia
CREATE TABLE IF NOT EXISTS asistencia (
  idAsistencia INTEGER PRIMARY KEY AUTOINCREMENT,
  idClase INTEGER NOT NULL,
  idEstudiante INTEGER NOT NULL,
  estado TEXT NOT NULL, -- presente, ausente, tardanza, justificado
  observaciones TEXT,
  fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP, -- TIMESTAMP
  fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP, -- TIMESTAMP (Note: ON UPDATE requires Trigger in SQLite, omitted for simplicity)
  FOREIGN KEY (idClase) REFERENCES clases(idClase),
  FOREIGN KEY (idEstudiante) REFERENCES usuarios(idUsuarios)
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_asistencia ON asistencia (idClase, idEstudiante);

-- Tabla de reportes
CREATE TABLE IF NOT EXISTS reportes (
  idReporte INTEGER PRIMARY KEY AUTOINCREMENT,
  idProfesor INTEGER NOT NULL,
  idCurso INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- rendimiento, asistencia, comportamiento
  fecha_generacion TEXT NOT NULL, -- DATETIME
  periodo TEXT,
  contenido TEXT, -- JSON as TEXT
  estado TEXT DEFAULT 'generado',
  FOREIGN KEY (idProfesor) REFERENCES usuarios(idUsuarios),
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso)
);

-- Tabla de horarios
CREATE TABLE IF NOT EXISTS horarios (
  idHorario INTEGER PRIMARY KEY AUTOINCREMENT,
  idCurso INTEGER NOT NULL,
  dia_semana INTEGER NOT NULL, -- 1=Lunes, 2=Martes, etc.
  hora_inicio TEXT NOT NULL, -- TIME
  hora_fin TEXT NOT NULL, -- TIME
  salon TEXT,
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso)
);

CREATE TABLE IF NOT EXISTS usuario_profesor (
  idUsuario INTEGER PRIMARY KEY,
  especialidad TEXT DEFAULT NULL,
  titulo TEXT DEFAULT NULL,
  FOREIGN KEY (idUsuario) REFERENCES usuarios (idUsuarios) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Mensajería
CREATE TABLE IF NOT EXISTS mensajes (
  idMensaje INTEGER PRIMARY KEY AUTOINCREMENT,
  idRemitente INTEGER NOT NULL,
  idDestinatario INTEGER NOT NULL,
  asunto TEXT,
  contenido TEXT NOT NULL,
  fecha_envio TEXT DEFAULT CURRENT_TIMESTAMP, -- DATETIME
  leido INTEGER DEFAULT 0, -- BOOLEAN
  FOREIGN KEY (idRemitente) REFERENCES usuarios(idUsuarios),
  FOREIGN KEY (idDestinatario) REFERENCES usuarios(idUsuarios)
);

-- Materiales de estudio
CREATE TABLE IF NOT EXISTS materiales (
  idMaterial INTEGER PRIMARY KEY AUTOINCREMENT,
  idCurso INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  url_archivo TEXT,
  tipo TEXT, -- 'documento', 'video', 'enlace'
  fecha_publicacion TEXT DEFAULT CURRENT_TIMESTAMP, -- DATETIME
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso)
);

-- Eventos / Avisos
CREATE TABLE IF NOT EXISTS eventos (
  idEvento INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TEXT NOT NULL, -- DATETIME
  fecha_fin TEXT, -- DATETIME
  ubicacion TEXT,
  tipo TEXT, -- 'academico', 'evento', 'aviso'
  destinatarios TEXT -- 'todos', 'estudiantes', 'padres', 'profesores'
);

-- Relación Padre-Estudiante (Mejorando el esquema existente)
CREATE TABLE IF NOT EXISTS padre_estudiante (
  idPadre INTEGER NOT NULL,
  idEstudiante INTEGER NOT NULL,
  PRIMARY KEY (idPadre, idEstudiante),
  FOREIGN KEY (idPadre) REFERENCES usuarios(idUsuarios),
  FOREIGN KEY (idEstudiante) REFERENCES usuarios(idUsuarios)
);

-- Tabla de Log del Sistema
CREATE TABLE IF NOT EXISTS system_log (
  idLog INTEGER PRIMARY KEY AUTOINCREMENT,
  idUsuario INTEGER,
  accion TEXT NOT NULL,
  fecha TEXT DEFAULT CURRENT_TIMESTAMP, -- TIMESTAMP
  detalles TEXT, -- JSON
  FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuarios)
);
