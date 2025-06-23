-- Creacion de la DB
CREATE DATABASE Edunet;

-- Uso de la DB
USE Edunet;

-- Tabla Directivo
CREATE TABLE Directivo (
    idDirectivo INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(45),
    apellido VARCHAR(45),
    cargo VARCHAR(45),
    correo VARCHAR(45)
);

-- Tabla Profesor
CREATE TABLE Profesor (
    idProfesor INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(45),
    apellido VARCHAR(45),
    correo VARCHAR(100),
    especialidad VARCHAR(45)
);
-- Tabla Grado
CREATE TABLE Grado (
    idGrado INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(45),
    idProfesor INT,
    FOREIGN KEY (idProfesor) REFERENCES Profesor(idProfesor)
);

-- Tabla Curso
CREATE TABLE Curso (
    idCurso INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(45),
    idGrado INT,
    FOREIGN KEY (idGrado) REFERENCES Grado(idGrado)
);

-- Tabla Matricula
CREATE TABLE Matricula (
    idMatricula INT PRIMARY KEY AUTO_INCREMENT,
    idCurso INT,
    idDirectivo INT,
    fechaMatricula DATE,
    FOREIGN KEY (idCurso) REFERENCES Curso(idCurso),
    FOREIGN KEY (idDirectivo) REFERENCES Directivo(idDirectivo)
);

-- Tabla Estudiante
CREATE TABLE Estudiante (
    idEstudiante INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(45),
    apellido VARCHAR(45),
    correo VARCHAR(45),
    idMatricula INT,
    FOREIGN KEY (idMatricula) REFERENCES Matricula(idMatricula)
);

-- Tabla Acudiente
CREATE TABLE Acudiente (
    idAcudiente INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(45),
    apellido VARCHAR(45),
    telefono VARCHAR(45),
    correo VARCHAR(45),
    parentesco VARCHAR(45),
    idEstudiante INT,
    FOREIGN KEY (idEstudiante) REFERENCES Estudiante(idEstudiante)
);

-- Tabla Materia
CREATE TABLE Materia (
    idMateria INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50),
    descripcion VARCHAR(100),
    idCurso INT,
    idProfesor INT,
    FOREIGN KEY (idCurso) REFERENCES Curso(idCurso),
    FOREIGN KEY (idProfesor) REFERENCES Profesor(idProfesor)
);

-- Tabla Nota
CREATE TABLE Nota (
    idNota INT PRIMARY KEY AUTO_INCREMENT,
    idEstudiante INT,
    idMateria INT,
    nota DECIMAL(5,2),
    fecha DATE,
    FOREIGN KEY (idEstudiante) REFERENCES Estudiante(idEstudiante),
    FOREIGN KEY (idMateria) REFERENCES Materia(idMateria)
);

-- Tabla Observacion
CREATE TABLE Observacion (
    idObservacion INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(45),
    tipo VARCHAR(45),
    fecha DATE,
    idEstudiante INT,
    idProfesor INT,
    FOREIGN KEY (idEstudiante) REFERENCES Estudiante(idEstudiante),
    FOREIGN KEY (idProfesor) REFERENCES Profesor(idProfesor)
);

-- Tabla Calendario
CREATE TABLE Calendario (
    idCalendario INT PRIMARY KEY AUTO_INCREMENT,
    nombreEvento VARCHAR(45),
    tipoEvento VARCHAR(100),
    fecha DATE,
    idCurso INT,
    FOREIGN KEY (idCurso) REFERENCES Curso(idCurso)
);

-- Tabla Mensaje
CREATE TABLE Mensaje (
    idMensaje INT PRIMARY KEY AUTO_INCREMENT,
    emisor VARCHAR(45),
    receptor VARCHAR(45),
    fechaEnvio DATE,
    idEstudiante INT,
    idProfesor INT,
    idAcudiente INT,
    idDirectivo INT,
    FOREIGN KEY (idEstudiante) REFERENCES Estudiante(idEstudiante),
    FOREIGN KEY (idProfesor) REFERENCES Profesor(idProfesor),
    FOREIGN KEY (idAcudiente) REFERENCES Acudiente(idAcudiente),
    FOREIGN KEY (idDirectivo) REFERENCES Directivo(idDirectivo)
);

-- Tabla Recurso
CREATE TABLE Recurso (
    idRecurso INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(45),
    tipo VARCHAR(45),
    fechaSubida DATE,
    idMateria INT,
    FOREIGN KEY (idMateria) REFERENCES Materia(idMateria)
);

-- aqui poner los insert

