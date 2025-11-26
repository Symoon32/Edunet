CREATE SCHEMA IF NOT EXISTS edunet;
use edunet;
CREATE TABLE usuarios (
  idUsuarios INT NOT NULL AUTO_INCREMENT,
  nombres VARCHAR(45) NOT NULL,
  apellidos VARCHAR(45) NOT NULL,
  correo VARCHAR(45) NOT NULL,
  documento INT NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  direccion VARCHAR(45) NOT NULL,
  fotoPerfil VARCHAR(255) NULL,
  password VARCHAR(200) NOT NULL,
  grado varchar(5),
  contacto_emergencia VARCHAR(45),
  telefono_contacto_emergencia VARCHAR(20),
  curso_asignado VARCHAR(20),
  nombre_estudiante_acargo VARCHAR(45),
  parentezco VARCHAR(20),
  cargo_admin VARCHAR(20),
  idRol INT NOT NULL,
  is_rector BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (`idUsuarios`),
  UNIQUE INDEX `correo_UNIQUE` (`correo` ASC));
  
  
  CREATE TABLE roles(
idRol int primary key auto_increment,
nombreRol varchar(20)
);

ALTER TABLE usuarios 
ADD INDEX userRol_idx (`idRol` ASC);

ALTER TABLE usuarios
ADD CONSTRAINT userRol
  FOREIGN KEY (`idRol`)
  REFERENCES `edunet`.`roles` (`idRol`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;
  
INSERT INTO roles (nombreRol) VALUES ("estudiante");
INSERT INTO roles (nombreRol) VALUES ("profesor");
INSERT INTO roles (nombreRol) VALUES ("acudiente");
INSERT INTO roles (nombreRol) VALUES ("administrador");

-- Tabla de materias
CREATE TABLE materias (
  idMateria INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(45) NOT NULL,
  descripcion TEXT,
  codigo VARCHAR(10) NOT NULL UNIQUE,
  PRIMARY KEY (idMateria)
);

-- Tabla de cursos (representa un grupo específico de una materia)
CREATE TABLE cursos (
  idCurso INT NOT NULL AUTO_INCREMENT,
  idMateria INT NOT NULL,
  idProfesor INT NOT NULL,
  periodo VARCHAR(20) NOT NULL,
  anio INT NOT NULL,
  grado VARCHAR(10) NOT NULL,
  seccion VARCHAR(5) NOT NULL,
  PRIMARY KEY (idCurso),
  FOREIGN KEY (idMateria) REFERENCES materias(idMateria),
  FOREIGN KEY (idProfesor) REFERENCES usuarios(idUsuarios)
);

-- Tabla de estudiantes por curso
CREATE TABLE curso_estudiante (
  idCurso INT NOT NULL,
  idEstudiante INT NOT NULL,
  fechaInscripcion DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo',
  PRIMARY KEY (idCurso, idEstudiante),
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso),
  FOREIGN KEY (idEstudiante) REFERENCES usuarios(idUsuarios)
);

-- Tabla de calificaciones
CREATE TABLE calificaciones (
  idCalificacion INT NOT NULL AUTO_INCREMENT,
  idCurso INT NOT NULL,
  idEstudiante INT NOT NULL,
  tipo VARCHAR(30) NOT NULL, -- parcial, final, tarea, proyecto, etc.
  nombre VARCHAR(100) NOT NULL,
  valor DECIMAL(5,2) NOT NULL,
  peso DECIMAL(5,2) NOT NULL, -- porcentaje que vale esta calificación
  fecha_asignacion DATE NOT NULL,
  fecha_entrega DATE,
  comentarios TEXT,
  PRIMARY KEY (idCalificacion),
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso),
  FOREIGN KEY (idEstudiante) REFERENCES usuarios(idUsuarios)
);

-- Tabla de clases (sesiones)
CREATE TABLE clases (
  idClase INT NOT NULL AUTO_INCREMENT,
  idCurso INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  tema VARCHAR(200),
  descripcion TEXT,
  estado VARCHAR(20) DEFAULT 'programada', -- programada, realizada, cancelada
  PRIMARY KEY (idClase),
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso)
);

-- Tabla de asistencia
CREATE TABLE asistencia (
  idAsistencia INT NOT NULL AUTO_INCREMENT,
  idClase INT NOT NULL,
  idEstudiante INT NOT NULL,
  estado VARCHAR(20) NOT NULL, -- presente, ausente, tardanza, justificado
  observaciones TEXT,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (idAsistencia),
  FOREIGN KEY (idClase) REFERENCES clases(idClase),
  FOREIGN KEY (idEstudiante) REFERENCES usuarios(idUsuarios),
  UNIQUE KEY unique_asistencia (idClase, idEstudiante)
);

-- Tabla de reportes
CREATE TABLE reportes (
  idReporte INT NOT NULL AUTO_INCREMENT,
  idProfesor INT NOT NULL,
  idCurso INT NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- rendimiento, asistencia, comportamiento
  fecha_generacion DATETIME NOT NULL,
  periodo VARCHAR(20),
  contenido JSON,
  estado VARCHAR(20) DEFAULT 'generado',
  PRIMARY KEY (idReporte),
  FOREIGN KEY (idProfesor) REFERENCES usuarios(idUsuarios),
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso)
);

-- Tabla de horarios
CREATE TABLE horarios (
  idHorario INT NOT NULL AUTO_INCREMENT,
  idCurso INT NOT NULL,
  dia_semana INT NOT NULL, -- 1=Lunes, 2=Martes, etc.
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  salon VARCHAR(20),
  PRIMARY KEY (idHorario),
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso)
);

-- Datos de ejemplo para materias
INSERT INTO materias (nombre, descripcion, codigo) VALUES 
('Matemáticas', 'Curso básico de matemáticas', 'MAT101'),
('Lenguaje', 'Curso de lenguaje y comunicación', 'LEN101'),
('Ciencias Naturales', 'Curso de ciencias naturales', 'CNA101'),
('Historia', 'Curso de historia y geografía', 'HIS101');
INSERT INTO usuarios (
  nombres, apellidos, correo, documento, telefono, direccion, fotoPerfil,
  password, grado, contacto_emergencia, telefono_contacto_emergencia,
  curso_asignado, nombre_estudiante_acargo, parentezco, cargo_admin, idRol
) VALUES (
  'Juan', 'Perez', 'juan.perez@edunet.test', 10000001, '3001234567', 'Calle 1', NULL,
  '$2b$10$xxm.jDZ6eX1CfIv.zS2VuOXriVYoGbcUw4IU70nZDDYpZ6cAZLJsu', NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, 2
);
CREATE TABLE IF NOT EXISTS usuario_profesor (
  idUsuario INT NOT NULL,
  especialidad VARCHAR(255) DEFAULT NULL,
  titulo VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (idUsuario),
  CONSTRAINT fk_usuario_profesor_usuario FOREIGN KEY (idUsuario)
    REFERENCES usuarios (idUsuarios)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Mensajería
CREATE TABLE mensajes (
  idMensaje INT NOT NULL AUTO_INCREMENT,
  idRemitente INT NOT NULL,
  idDestinatario INT NOT NULL,
  asunto VARCHAR(100),
  contenido TEXT NOT NULL,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  leido BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (idMensaje),
  FOREIGN KEY (idRemitente) REFERENCES usuarios(idUsuarios),
  FOREIGN KEY (idDestinatario) REFERENCES usuarios(idUsuarios)
);

-- Materiales de estudio
CREATE TABLE materiales (
  idMaterial INT NOT NULL AUTO_INCREMENT,
  idCurso INT NOT NULL,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  url_archivo VARCHAR(255),
  tipo VARCHAR(50), -- 'documento', 'video', 'enlace'
  fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (idMaterial),
  FOREIGN KEY (idCurso) REFERENCES cursos(idCurso)
);

-- Eventos / Avisos
CREATE TABLE eventos (
  idEvento INT NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(100) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATETIME NOT NULL,
  fecha_fin DATETIME,
  ubicacion VARCHAR(100),
  tipo VARCHAR(20), -- 'academico', 'evento', 'aviso'
  destinatarios VARCHAR(20), -- 'todos', 'estudiantes', 'padres', 'profesores'
  PRIMARY KEY (idEvento)
);

-- Relación Padre-Estudiante (Mejorando el esquema existente)
CREATE TABLE padre_estudiante (
  idPadre INT NOT NULL,
  idEstudiante INT NOT NULL,
  PRIMARY KEY (idPadre, idEstudiante),
  FOREIGN KEY (idPadre) REFERENCES usuarios(idUsuarios),
  FOREIGN KEY (idEstudiante) REFERENCES usuarios(idUsuarios)
);

-- Tabla de Log del Sistema
CREATE TABLE system_log (
  idLog INT NOT NULL AUTO_INCREMENT,
  idUsuario INT,
  accion VARCHAR(255) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  detalles JSON,
  PRIMARY KEY (idLog),
  FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuarios)
);