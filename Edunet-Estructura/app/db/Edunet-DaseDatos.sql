CREATE SCHEMA IF NOT EXISTS `Edunet` DEFAULT CHARACTER SET utf8 ;
USE `Edunet` ;


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

DROP TABLE IF EXISTS `Matricula`;

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

DROP TABLE IF EXISTS `Estudiante`;

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

DROP TABLE IF EXISTS `Acudiente`;

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

DROP TABLE IF EXISTS `Profesor`;

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

DROP TABLE IF EXISTS `Curso`;

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

DROP TABLE IF EXISTS `Nota`;

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

DROP TABLE IF EXISTS `Grado`;

CREATE TABLE IF NOT EXISTS `Grado` (
  `idGrado` VARCHAR(45) NOT NULL COMMENT 'Identificador único del grado',
  `nombreGrado` VARCHAR(45) NOT NULL COMMENT 'Nombre del grado (Octavo, Séptimo, etc.)',
  `horario` VARCHAR(45) NOT NULL COMMENT 'Horario de las materias',

  `Profesor_idProfesor` INT NOT NULL COMMENT 'ID del profesor',
  `Curso_idCurso` INT NOT NULL COMMENT 'ID del curso',
  `Curso_Estudiantes_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante del curso',
  `Curso_Estudiantes_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de la matrícula del curso',

  PRIMARY KEY (
    `idGrado`,
    `Profesor_idProfesor`,
    `Curso_idCurso`,
    `Curso_Estudiantes_idEstudiante`,
    `Curso_Estudiantes_Matricula_idMatricula`
  ),

  INDEX `idx_Grado_Profesor` (`Profesor_idProfesor`),
  INDEX `idx_Grado_Curso` (`Curso_idCurso`, `Curso_Estudiantes_idEstudiante`, `Curso_Estudiantes_Matricula_idMatricula`),

  CONSTRAINT `fk_Grado_Profesor`
    FOREIGN KEY (`Profesor_idProfesor`)
    REFERENCES `Profesor` (`idProfesor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,

  CONSTRAINT `fk_Grado_Curso`
    FOREIGN KEY (
      `Curso_idCurso`,
      `Curso_Estudiantes_idEstudiante`,
      `Curso_Estudiantes_Matricula_idMatricula`
    )
    REFERENCES `Curso` (
      `idCurso`,
      `Estudiantes_idEstudiante`,
      `Estudiantes_Matricula_idMatricula`
    )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;





-- Tabla: Materia

DROP TABLE IF EXISTS `Materia`;

CREATE TABLE IF NOT EXISTS `Materia` (
  `idMateria` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la materia',
  `nombre` VARCHAR(50) NOT NULL COMMENT 'Nombre de la materia',
  `descripcion` VARCHAR(100) NOT NULL COMMENT 'Descripción de la materia',
  
  `Curso_idCurso` INT NOT NULL COMMENT 'ID del curso al que pertenece la materia',
  `Curso_Estudiantes_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante vinculado al curso',
  `Curso_Estudiantes_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de la matrícula del estudiante',
  `Profesor_idProfesor` INT NOT NULL COMMENT 'ID del profesor encargado de la materia',

  PRIMARY KEY (`idMateria`),

  INDEX `idx_Materia_Curso` (
    `Curso_idCurso`,
    `Curso_Estudiantes_idEstudiante`,
    `Curso_Estudiantes_Matricula_idMatricula`
  ),

  INDEX `idx_Materia_Profesor` (`Profesor_idProfesor`),

  CONSTRAINT `fk_Materia_Curso`
    FOREIGN KEY (
      `Curso_idCurso`,
      `Curso_Estudiantes_idEstudiante`,
      `Curso_Estudiantes_Matricula_idMatricula`
    )
    REFERENCES `Curso` (
      `idCurso`,
      `Estudiantes_idEstudiante`,
      `Estudiantes_Matricula_idMatricula`
    )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,

  CONSTRAINT `fk_Materia_Profesor`
    FOREIGN KEY (`Profesor_idProfesor`)
    REFERENCES `Profesor` (`idProfesor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;



-- Tabla: Observacion

DROP TABLE IF EXISTS `Observacion`;

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

DROP TABLE IF EXISTS `Mensaje`;

CREATE TABLE IF NOT EXISTS `Mensaje` (
  `idMensaje` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del mensaje',
  `emisor` VARCHAR(30) NOT NULL COMMENT 'Nombre del remitente',
  `receptor` VARCHAR(30) NOT NULL COMMENT 'Nombre o rol del destinatario',
  `fechaEnvio` DATE NOT NULL COMMENT 'Fecha en que se envió el mensaje',
  `contenido` TEXT NOT NULL COMMENT 'Texto o cuerpo del mensaje',

  `idDirectivo` INT NULL COMMENT 'ID del directivo involucrado',
  `idAcudiente` INT NULL COMMENT 'ID del acudiente involucrado',
  `idProfesor` INT NULL COMMENT 'ID del profesor involucrado',
  `idEstudiante` INT NULL COMMENT 'ID del estudiante involucrado',

  PRIMARY KEY (`idMensaje`),

  INDEX (`idDirectivo`),
  INDEX (`idAcudiente`),
  INDEX (`idProfesor`),
  INDEX (`idEstudiante`),

  CONSTRAINT `fk_Mensaje_Directivo`
    FOREIGN KEY (`idDirectivo`)
    REFERENCES `Directivo` (`idDirectivo`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT `fk_Mensaje_Acudiente`
    FOREIGN KEY (`idAcudiente`)
    REFERENCES `Acudiente` (`idAcudiente`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT `fk_Mensaje_Profesor`
    FOREIGN KEY (`idProfesor`)
    REFERENCES `Profesor` (`idProfesor`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT `fk_Mensaje_Estudiante`
    FOREIGN KEY (`idEstudiante`)
    REFERENCES `Estudiante` (`idEstudiante`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE = InnoDB;




-- Tabla: Calendario

DROP TABLE IF EXISTS `Calendario`;

CREATE TABLE IF NOT EXISTS `Calendario` (
  `idCalendario` INT NOT NULL COMMENT 'Identificador único del evento',
  `nombreEvento` VARCHAR(45) NOT NULL COMMENT 'Nombre del evento',
  `tipoDeEvento` VARCHAR(100) NOT NULL COMMENT 'Tipo de evento (reunión, salida pedagógica, etc.)',
  `fechaEvento` DATE NOT NULL COMMENT 'Fecha en que se realiza el evento',

  `Acudiente_idAcudiente` INT NOT NULL COMMENT 'ID del acudiente',
  `Acudiente_Estudiantes_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante relacionado con el acudiente',
  `Acudiente_Estudiantes_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de la matrícula del estudiante del acudiente',

  `Estudiante_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante directamente relacionado',
  `Estudiante_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de la matrícula del estudiante',
  `Estudiante_Matricula_Directivo_idDirectivo` INT NOT NULL COMMENT 'ID del directivo que aprobó la matrícula',

  `Profesor_idProfesor` INT NOT NULL COMMENT 'ID del profesor involucrado en el evento',

  PRIMARY KEY (
    `idCalendario`,
    `Acudiente_idAcudiente`,
    `Acudiente_Estudiantes_idEstudiante`,
    `Acudiente_Estudiantes_Matricula_idMatricula`,
    `Estudiante_idEstudiante`,
    `Estudiante_Matricula_idMatricula`,
    `Estudiante_Matricula_Directivo_idDirectivo`,
    `Profesor_idProfesor`
  ),

  INDEX `idx_Calendario_Acudiente` (`Acudiente_idAcudiente`, `Acudiente_Estudiantes_idEstudiante`, `Acudiente_Estudiantes_Matricula_idMatricula`),
  INDEX `idx_Calendario_Estudiante` (`Estudiante_idEstudiante`, `Estudiante_Matricula_idMatricula`, `Estudiante_Matricula_Directivo_idDirectivo`),
  INDEX `idx_Calendario_Profesor` (`Profesor_idProfesor`),

  CONSTRAINT `fk_Calendario_Acudiente`
    FOREIGN KEY (
      `Acudiente_idAcudiente`,
      `Acudiente_Estudiantes_idEstudiante`,
      `Acudiente_Estudiantes_Matricula_idMatricula`
    )
    REFERENCES `Acudiente` (
      `idAcudiente`,
      `Estudiantes_idEstudiante`,
      `Estudiantes_Matricula_idMatricula`
    )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,

  CONSTRAINT `fk_Calendario_Estudiante`
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
    ON UPDATE NO ACTION,

  CONSTRAINT `fk_Calendario_Profesor`
    FOREIGN KEY (`Profesor_idProfesor`)
    REFERENCES `Profesor` (`idProfesor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- 	Tabla Documento

DROP TABLE IF EXISTS `DocumentoIdentidad`;

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

DROP TABLE IF EXISTS `calificaciones`;

CREATE TABLE IF NOT EXISTS `calificaciones` (
  `id_calificaciones` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador exclusivo de la calificación',
  `nota_calificacion` DOUBLE NULL COMMENT 'Nota obtenida',
  `promedio_calificacion` DOUBLE NULL COMMENT 'Promedio de la calificación',

  `Nota_idAsignación` INT NOT NULL COMMENT 'ID de la asignación',
  `Nota_Estudiante_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante de la asignación',
  `Nota_Estudiante_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de matrícula de la asignación',
  `Nota_Estudiante_Matricula_Directivo_idDirectivo` INT NOT NULL COMMENT 'ID del directivo de la asignación',

  `Curso_idCurso` INT NOT NULL COMMENT 'ID del curso',
  `Curso_Estudiantes_idEstudiante` INT NOT NULL COMMENT 'ID del estudiante del curso',
  `Curso_Estudiantes_Matricula_idMatricula` INT NOT NULL COMMENT 'ID de matrícula del curso',

  PRIMARY KEY (
    `id_calificaciones`,
    `Nota_idAsignación`,
    `Nota_Estudiante_idEstudiante`,
    `Nota_Estudiante_Matricula_idMatricula`,
    `Nota_Estudiante_Matricula_Directivo_idDirectivo`,
    `Curso_idCurso`,
    `Curso_Estudiantes_idEstudiante`,
    `Curso_Estudiantes_Matricula_idMatricula`
  ),

  INDEX `idx_Calificaciones_Nota` (`Nota_idAsignación`, `Nota_Estudiante_idEstudiante`, `Nota_Estudiante_Matricula_idMatricula`, `Nota_Estudiante_Matricula_Directivo_idDirectivo`),
  INDEX `idx_Calificaciones_Curso` (`Curso_idCurso`, `Curso_Estudiantes_idEstudiante`, `Curso_Estudiantes_Matricula_idMatricula`),

  CONSTRAINT `fk_Calificaciones_Nota`
    FOREIGN KEY (`Nota_idAsignación`, `Nota_Estudiante_idEstudiante`, `Nota_Estudiante_Matricula_idMatricula`, `Nota_Estudiante_Matricula_Directivo_idDirectivo`)
    REFERENCES `Nota` (`idAsignación`, `Estudiante_idEstudiante`, `Estudiante_Matricula_idMatricula`, `Estudiante_Matricula_Directivo_idDirectivo`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,

  CONSTRAINT `fk_Calificaciones_Curso`
    FOREIGN KEY (`Curso_idCurso`, `Curso_Estudiantes_idEstudiante`, `Curso_Estudiantes_Matricula_idMatricula`)
    REFERENCES `Curso` (`idCurso`, `Estudiantes_idEstudiante`, `Estudiantes_Matricula_idMatricula`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB;

-- Tabla Calificaciones

DROP TABLE IF EXISTS `calificaciones`;

CREATE TABLE IF NOT EXISTS `calificaciones` (
  `id_calificaciones` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador exclusivo de la calificación',
  `nota_calificacion` DOUBLE NULL COMMENT 'Nota obtenida',
  `promedio_calificacion` DOUBLE NULL COMMENT 'Promedio de la calificación',

  `idNota` INT NOT NULL COMMENT 'ID de la nota (asignación)',
  `idCurso` INT NOT NULL COMMENT 'Curso relacionado con la calificación',

  PRIMARY KEY (`id_calificaciones`),

  INDEX `idx_Calificaciones_Nota` (`idNota`),
  INDEX `idx_Calificaciones_Curso` (`idCurso`),

  CONSTRAINT `fk_Calificaciones_Nota`
    FOREIGN KEY (`idNota`)
    REFERENCES `Nota` (`idAsignacion`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `fk_Calificaciones_Curso`
    FOREIGN KEY (`idCurso`)
    REFERENCES `Curso` (`idCurso`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE = InnoDB;







