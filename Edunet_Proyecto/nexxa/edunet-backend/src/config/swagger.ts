import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Edunet API',
      version: '1.0.0',
      description: 'API REST para el sistema de gestión educativa Edunet',
      contact: {
        name: 'Edunet Team',
        email: 'support@edunet.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.edunet.com',
        description: 'Servidor de producción'
      }
    ],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para autenticación y registro de usuarios'
      },
      {
        name: 'Usuarios',
        description: 'Gestión de usuarios del sistema'
      },
      {
        name: 'Profesor',
        description: 'Endpoints específicos para profesores'
      },
      {
        name: 'Cursos',
        description: 'Gestión de cursos'
      },
      {
        name: 'Materias',
        description: 'Gestión de materias'
      },
      {
        name: 'Calificaciones',
        description: 'Gestión de calificaciones'
      },
      {
        name: 'Asistencia',
        description: 'Registro y consulta de asistencia'
      },
      {
        name: 'Clases',
        description: 'Gestión de clases'
      },
      {
        name: 'Materiales',
        description: 'Gestión de materiales educativos'
      },
      {
        name: 'Mensajes',
        description: 'Sistema de mensajería'
      },
      {
        name: 'Eventos',
        description: 'Gestión de eventos académicos'
      },
      {
        name: 'Reportes',
        description: 'Reportes para estudiantes y administradores'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingrese el token JWT obtenido del endpoint de login'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error'
            },
            details: {
              type: 'string',
              description: 'Detalles adicionales del error'
            }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            idPersona: {
              type: 'integer',
              description: 'ID único de la persona'
            },
            nombre: {
              type: 'string',
              description: 'Nombre completo del usuario'
            },
            correo: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico (único)'
            },
            contraseña: {
              type: 'string',
              format: 'password',
              description: 'Contraseña (hasheada en BD)'
            },
            telefono: {
              type: 'string',
              description: 'Número de teléfono'
            },
            direccion: {
              type: 'string',
              description: 'Dirección física'
            },
            fechaNacimiento: {
              type: 'string',
              format: 'date',
              description: 'Fecha de nacimiento (YYYY-MM-DD)'
            },
            fotoPerfil: {
              type: 'string',
              description: 'URL de la foto de perfil'
            },
            idRol: {
              type: 'integer',
              description: 'ID del rol (1=Estudiante, 2=Profesor, 3=Acudiente, 4=Admin)'
            }
          },
          required: ['nombre', 'correo', 'contraseña', 'idRol']
        },
        LoginRequest: {
          type: 'object',
          properties: {
            correo: {
              type: 'string',
              format: 'email',
              example: 'usuario@edunet.com'
            },
            contraseña: {
              type: 'string',
              format: 'password',
              example: 'password123'
            }
          },
          required: ['correo', 'contraseña']
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login exitoso'
            },
            token: {
              type: 'string',
              description: 'Token JWT para autenticación',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                idPersona: { type: 'integer' },
                correo: { type: 'string' },
                nombre: { type: 'string' },
                idRol: { type: 'integer' }
              }
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            nombre: {
              type: 'string',
              example: 'Juan Pérez'
            },
            correo: {
              type: 'string',
              format: 'email',
              example: 'juan.perez@edunet.com'
            },
            contraseña: {
              type: 'string',
              format: 'password',
              example: 'password123'
            },
            telefono: {
              type: 'string',
              example: '+57 300 123 4567'
            },
            direccion: {
              type: 'string',
              example: 'Calle 123 #45-67'
            },
            fechaNacimiento: {
              type: 'string',
              format: 'date',
              example: '2000-01-15'
            },
            idRol: {
              type: 'integer',
              example: 1,
              description: '1=Estudiante, 2=Profesor, 3=Acudiente, 4=Admin'
            }
          },
          required: ['nombre', 'correo', 'contraseña', 'idRol']
        },
        Curso: {
          type: 'object',
          properties: {
            idCurso: {
              type: 'integer',
              description: 'ID único del curso'
            },
            nombreCurso: {
              type: 'string',
              description: 'Nombre del curso',
              example: 'Matemáticas Avanzadas'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del curso'
            },
            año: {
              type: 'integer',
              description: 'Año académico',
              example: 2024
            }
          }
        },
        Materia: {
          type: 'object',
          properties: {
            idMateria: {
              type: 'integer',
              description: 'ID único de la materia'
            },
            nombreMateria: {
              type: 'string',
              description: 'Nombre de la materia',
              example: 'Cálculo Diferencial'
            },
            creditos: {
              type: 'integer',
              description: 'Número de créditos',
              example: 3
            },
            idCurso: {
              type: 'integer',
              description: 'ID del curso al que pertenece'
            }
          }
        },
        Calificacion: {
          type: 'object',
          properties: {
            idCalificacion: {
              type: 'integer',
              description: 'ID único de la calificación'
            },
            idEstudiante: {
              type: 'integer',
              description: 'ID del estudiante'
            },
            idMateria: {
              type: 'integer',
              description: 'ID de la materia'
            },
            nota: {
              type: 'number',
              format: 'float',
              description: 'Calificación numérica',
              example: 4.5
            },
            periodo: {
              type: 'string',
              description: 'Periodo académico',
              example: '2024-1'
            },
            fecha: {
              type: 'string',
              format: 'date',
              description: 'Fecha de la calificación'
            }
          }
        },
        Asistencia: {
          type: 'object',
          properties: {
            idAsistencia: {
              type: 'integer',
              description: 'ID único del registro de asistencia'
            },
            idEstudiante: {
              type: 'integer',
              description: 'ID del estudiante'
            },
            idClase: {
              type: 'integer',
              description: 'ID de la clase'
            },
            fecha: {
              type: 'string',
              format: 'date',
              description: 'Fecha de la asistencia'
            },
            estado: {
              type: 'string',
              enum: ['Presente', 'Ausente', 'Tardanza', 'Justificado'],
              description: 'Estado de asistencia'
            }
          }
        },
        Clase: {
          type: 'object',
          properties: {
            idClase: {
              type: 'integer',
              description: 'ID único de la clase'
            },
            idMateria: {
              type: 'integer',
              description: 'ID de la materia'
            },
            idProfesor: {
              type: 'integer',
              description: 'ID del profesor'
            },
            fecha: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de la clase'
            },
            salon: {
              type: 'string',
              description: 'Salón donde se dicta la clase',
              example: 'A-101'
            },
            tema: {
              type: 'string',
              description: 'Tema de la clase'
            }
          }
        },
        Material: {
          type: 'object',
          properties: {
            idMaterial: {
              type: 'integer',
              description: 'ID único del material'
            },
            titulo: {
              type: 'string',
              description: 'Título del material'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del material'
            },
            url: {
              type: 'string',
              description: 'URL del archivo o recurso'
            },
            idMateria: {
              type: 'integer',
              description: 'ID de la materia asociada'
            },
            tipo: {
              type: 'string',
              enum: ['PDF', 'Video', 'Presentación', 'Enlace', 'Otro'],
              description: 'Tipo de material'
            }
          }
        },
        Mensaje: {
          type: 'object',
          properties: {
            idMensaje: {
              type: 'integer',
              description: 'ID único del mensaje'
            },
            idRemitente: {
              type: 'integer',
              description: 'ID del usuario remitente'
            },
            idDestinatario: {
              type: 'integer',
              description: 'ID del usuario destinatario'
            },
            asunto: {
              type: 'string',
              description: 'Asunto del mensaje'
            },
            contenido: {
              type: 'string',
              description: 'Contenido del mensaje'
            },
            fecha: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de envío'
            },
            leido: {
              type: 'boolean',
              description: 'Indica si el mensaje fue leído'
            }
          }
        },
        Evento: {
          type: 'object',
          properties: {
            idEvento: {
              type: 'integer',
              description: 'ID único del evento'
            },
            titulo: {
              type: 'string',
              description: 'Título del evento'
            },
            descripcion: {
              type: 'string',
              description: 'Descripción del evento'
            },
            fecha: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora del evento'
            },
            lugar: {
              type: 'string',
              description: 'Lugar donde se realizará el evento'
            },
            tipo: {
              type: 'string',
              enum: ['Académico', 'Cultural', 'Deportivo', 'Administrativo'],
              description: 'Tipo de evento'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token no válido o no proporcionado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Token no válido'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'No tiene permisos para acceder a este recurso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Acceso denegado',
                details: 'No tienes los permisos necesarios para realizar esta acción'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Recurso no encontrado'
              }
            }
          }
        },
        BadRequestError: {
          description: 'Solicitud inválida',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Datos inválidos',
                details: 'El correo ya está registrado'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/docs/*.ts'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
