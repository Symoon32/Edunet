CREATE SCHEMA IF NOT EXISTS edunet;
USE edunet;


-- Tabla: Directivo

CREATE TABLE IF NOT EXISTS `Directivo` (
    `idDirectivo` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del directivo',
    `nombreDirectivo` VARCHAR(45) NOT NULL COMMENT 'Nombre del directivo',
    `apellidoDirectivo` VARCHAR(45) NOT NULL COMMENT 'Apellido del directivo',
    `cargo` VARCHAR(45) NOT NULL COMMENT 'Cargo que desempeña',
    `correo` VARCHAR(100) NOT NULL COMMENT 'Correo institucional',
    `contraseña` VARCHAR(255) NOT NULL COMMENT 'Contraseña del directivo',
    PRIMARY KEY (`idDirectivo`)
) ENGINE = InnoDB;

-- Tabla: Matricula



CREATE TABLE IF NOT EXISTS `Matricula` (
    `idMatricula` INT NOT NULL COMMENT 'Identificador único de la matrícula',
    `idEstudiante` INT NOT NULL COMMENT 'ID del estudiante matriculado',
    `idCurso` VARCHAR(45) NOT NULL COMMENT 'Curso en el que se matricula',
    `añoEscolar` VARCHAR(45) NOT NULL COMMENT 'Año escolar correspondiente a la asignatura',
    `Directivo_idDirectivo` INT NOT NULL COMMENT 'ID del directivo responsable',
    
    PRIMARY KEY (`idMatricula`, `Directivo_idDirectivo`),
    
    INDEX `fk_Matricula_Directivo1_idx` (`Directivo_idDirectivo`),
    
    CONSTRAINT `fk_Matricula_Directivo1`
        FOREIGN KEY (`Directivo_idDirectivo`)
        REFERENCES `Directivo` (`idDirectivo`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- Tabla Estudiante



CREATE TABLE IF NOT EXISTS `Estudiante` (
    `idEstudiante` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del estudiante',
    `nombreEstudiante` VARCHAR(45) NOT NULL COMMENT 'Nombre del estudiante',
    `apellidoEstudiante` VARCHAR(45) NOT NULL COMMENT 'Apellido del estudiante',
    `fechaNacimiento` DATE NOT NULL COMMENT 'Fecha de nacimiento del estudiante',
    `grado` INT NOT NULL COMMENT 'Grado escolar actual',
    `correo` VARCHAR(100) NOT NULL COMMENT 'Correo del estudiante',
    `contraseña` VARCHAR(255) NOT NULL COMMENT 'Contraseña del estudiante',
    `Matricula_idMatricula` INT NOT NULL COMMENT 'ID de la matrícula',
    `Matricula_Directivo_idDirectivo` INT NOT NULL COMMENT 'ID del directivo correspondiente',

    PRIMARY KEY (`idEstudiante`, `Matricula_idMatricula`, `Matricula_Directivo_idDirectivo`),

    INDEX `fk_Estudiantes_Matricula1_idx` (`Matricula_idMatricula`, `Matricula_Directivo_idDirectivo`),

    CONSTRAINT `fk_Estudiantes_Matricula1`
        FOREIGN KEY (`Matricula_idMatricula`, `Matricula_Directivo_idDirectivo`)
        REFERENCES `Matricula` (`idMatricula`, `Directivo_idDirectivo`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;



-- Tabla: Acudiente



CREATE TABLE IF NOT EXISTS `Acudiente` (
    `idAcudiente` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del acudiente',
    `nombreAcudiente` VARCHAR(45) NOT NULL COMMENT 'Nombre del acudiente',
    `apellidoAcudiente` VARCHAR(45) NOT NULL COMMENT 'Apellido del acudiente',
    `telefonoAcudiente` VARCHAR(45) NOT NULL COMMENT 'Teléfono de contacto',
    `correoAcudiente` VARCHAR(100) NOT NULL COMMENT 'Correo electrónico del acudiente',
    `contraseña` VARCHAR(255) NOT NULL COMMENT 'Contraseña del acudiente',
    `parentesco` VARCHAR(45) NOT NULL COMMENT 'Relación con el estudiante (madre, padre, etc.)',
    `Estudiantes_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante asociado',
    `Estudiantes_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de la matrícula del estudiante',
    `Estudiantes_Matricula_Directivo_idDirectivo` INT NOT NULL COMMENT 'ID del directivo asociado a la matrícula',

    PRIMARY KEY (`idAcudiente`, `Estudiantes_idEstudiante`, `Estudiantes_Matricula_idMatricula`, `Estudiantes_Matricula_Directivo_idDirectivo`),

    INDEX `fk_Acudiente_Estudiantes1_idx` (`Estudiantes_idEstudiante`, `Estudiantes_Matricula_idMatricula`, `Estudiantes_Matricula_Directivo_idDirectivo`),

    CONSTRAINT `fk_Acudiente_Estudiantes1`
        FOREIGN KEY (`Estudiantes_idEstudiante`, `Estudiantes_Matricula_idMatricula`, `Estudiantes_Matricula_Directivo_idDirectivo`)
        REFERENCES `Estudiante` (`idEstudiante`, `Matricula_idMatricula`, `Matricula_Directivo_idDirectivo`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;



-- Tabla: Profesor



CREATE TABLE IF NOT EXISTS `Profesor` (
    `idProfesor` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del profesor',
    `nombreProfesor` VARCHAR(45) NOT NULL COMMENT 'Nombre del profesor',
    `apellidoProfesor` VARCHAR(45) NOT NULL COMMENT 'Apellido del profesor',
    `correoProfesor` VARCHAR(100) NOT NULL COMMENT 'Correo del profesor',
    `contraseña` VARCHAR(255) NOT NULL COMMENT 'Contraseña del profesor',
    `especialidad` VARCHAR(45) NOT NULL COMMENT 'Especialidad del profesor',

    PRIMARY KEY (`idProfesor`)
) ENGINE = InnoDB;



-- Tabla: Curso



CREATE TABLE IF NOT EXISTS `Curso` (
    `idCurso` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del curso',
    `nombreCurso` VARCHAR(45) NOT NULL COMMENT 'Nombre del curso',
    `idProfesor` INT NOT NULL COMMENT 'ID del profesor que dicta el curso',
    
    `Estudiantes_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante',
    `Estudiantes_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de la matrícula del estudiante',
    `Estudiantes_Matricula_Directivo_idDirectivo` INT NOT NULL COMMENT 'ID del directivo que autorizó la matrícula',

    PRIMARY KEY (`idCurso`, `Estudiantes_idEstudiante`, `Estudiantes_Matricula_idMatricula`, `Estudiantes_Matricula_Directivo_idDirectivo`),

    INDEX `fk_Curso_Estudiantes1_idx` (`Estudiantes_idEstudiante`, `Estudiantes_Matricula_idMatricula`, `Estudiantes_Matricula_Directivo_idDirectivo`),
    INDEX `fk_Curso_Profesor_idx` (`idProfesor`),

    CONSTRAINT `fk_Curso_Estudiantes1`
        FOREIGN KEY (`Estudiantes_idEstudiante`, `Estudiantes_Matricula_idMatricula`, `Estudiantes_Matricula_Directivo_idDirectivo`)
        REFERENCES `Estudiante` (`idEstudiante`, `Matricula_idMatricula`, `Matricula_Directivo_idDirectivo`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,

    CONSTRAINT `fk_Curso_Profesor`
        FOREIGN KEY (`idProfesor`)
        REFERENCES `Profesor` (`idProfesor`)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;



-- Tabla: Nota



CREATE TABLE IF NOT EXISTS `Nota` (
    `idAsignacion` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador de la asignación o nota',
    `nota` DECIMAL(5,2) NOT NULL COMMENT 'Nota obtenida (ej: 4.50)',
    `fecha` DATE NOT NULL COMMENT 'Fecha en la que se registró la nota',
    
    `Estudiante_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante',
    `Estudiante_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de la matrícula',
    `Estudiante_Matricula_Directivo_idDirectivo` INT NOT NULL COMMENT 'ID del directivo',

    PRIMARY KEY (
        `idAsignacion`,
        `Estudiante_idEstudiante`,
        `Estudiante_Matricula_idMatricula`,
        `Estudiante_Matricula_Directivo_idDirectivo`
    ),

    INDEX `fk_Nota_Estudiante1_idx` (
        `Estudiante_idEstudiante`,
        `Estudiante_Matricula_idMatricula`,
        `Estudiante_Matricula_Directivo_idDirectivo`
    ),

    CONSTRAINT `fk_Nota_Estudiante1`
        FOREIGN KEY (
            `Estudiante_idEstudiante`,
            `Estudiante_Matricula_idMatricula`,
            `Estudiante_Matricula_Directivo_idDirectivo`
        )
        REFERENCES `Estudiante` (
            `idEstudiante`,
            `Matricula_idMatricula`,
            `Matricula_Directivo_idDirectivo`
        )
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
) ENGINE = InnoDB;



-- Tabla: Grado









-- Tabla: Materia







-- Tabla: Observacion



CREATE TABLE IF NOT EXISTS `Observacion` (
  `idObservacion` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la observación',
  `nombre` VARCHAR(45) NOT NULL COMMENT 'Título o nombre de la observación',
  `tipo` VARCHAR(45) NOT NULL COMMENT 'Tipo de observación (Felicitación, llamado de atención, etc.)',
  `fecha` DATE NOT NULL COMMENT 'Fecha en que se hizo la observación',

  `Profesor_idProfesor` INT NOT NULL COMMENT 'ID del profesor que realiza la observación',
  `Estudiante_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante observado',
  `Estudiante_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de la matrícula del estudiante',
  `Estudiante_Matricula_Directivo_idDirectivo` INT NOT NULL COMMENT 'ID del directivo asociado a la matrícula',

  PRIMARY KEY (`idObservacion`),

  INDEX `idx_Observacion_Profesor` (`Profesor_idProfesor`),
  INDEX `idx_Observacion_Estudiante` (
    `Estudiante_idEstudiante`,
    `Estudiante_Matricula_idMatricula`,
    `Estudiante_Matricula_Directivo_idDirectivo`
  ),

  CONSTRAINT `fk_Observacion_Profesor`
    FOREIGN KEY (`Profesor_idProfesor`)
    REFERENCES `Profesor` (`idProfesor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,

  CONSTRAINT `fk_Observacion_Estudiante`
    FOREIGN KEY (
      `Estudiante_idEstudiante`,
      `Estudiante_Matricula_idMatricula`,
      `Estudiante_Matricula_Directivo_idDirectivo`
    )
    REFERENCES `Estudiante` (
      `idEstudiante`,
      `Matricula_idMatricula`,
      `Matricula_Directivo_idDirectivo`
    )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- Tabla Mesaje





-- Tabla: Calendario






-- 	Tabla Documento



CREATE TABLE IF NOT EXISTS `DocumentoIdentidad` (
  `idDocumento` INT NOT NULL AUTO_INCREMENT COMMENT 'ID del documento',
  `tipoDocumento` VARCHAR(10) NOT NULL COMMENT 'CC, TI, CE, etc',
  `numeroDocumento` BIGINT NOT NULL COMMENT 'Número del documento',
  `fechaExpedicion` DATE NOT NULL COMMENT 'Fecha de expedición',
  `lugarExpedicion` VARCHAR(100) COMMENT 'Lugar donde se expidió',
  `nacionalidad` VARCHAR(45) NOT NULL,
  `fechaNacimiento` DATE NOT NULL,
  `grupoSanguineo` VARCHAR(5),
  
  `tipoPersona` ENUM('Estudiante','Acudiente','Profesor','Directivo') NOT NULL COMMENT 'Tipo de persona a la que pertenece el documento',
  `idPersona` INT NOT NULL COMMENT 'ID de la persona (Estudiante, Profesor, etc.)',

  PRIMARY KEY (`idDocumento`),

  INDEX (`tipoPersona`, `idPersona`)
) ENGINE = InnoDB;




-- Tabla: calificaciones




-- Tablas Daniel

CREATE TABLE usuarios (
  idUsuarios INT NOT NULL AUTO_INCREMENT,
  nombres VARCHAR(45) NOT NULL,
  apellidos VARCHAR(45) NOT NULL,
  correo VARCHAR(45) NOT NULL,
  documento INT NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  direccion VARCHAR(45) NOT NULL,
  password VARCHAR(200) NOT NULL,
  grado varchar(5),
  contacto_emergencia VARCHAR(45),
  telefono_contacto_emergencia VARCHAR(20),
  curso_asignado VARCHAR(20),
  nombre_estudiante_acargo VARCHAR(45),
  parentezco VARCHAR(20),
  cargo_admin VARCHAR(20),
  idRol INT NOT NULL,
  PRIMARY KEY (`idUsuarios`),
  UNIQUE INDEX `correo_UNIQUE` (`correo` ASC) VISIBLE);
  
  
  CREATE TABLE roles(
idRol int primary key auto_increment,
nombreRol varchar(20)
);

ALTER TABLE usuarios 
ADD INDEX userRol_idx (`idRol` ASC) VISIBLE;
;

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