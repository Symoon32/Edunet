# Edunet API - Documentación OpenAPI/Swagger

## Acceso a la Documentación Interactiva

La API de Edunet incluye documentación interactiva generada con Swagger/OpenAPI 3.0.

### URL de Acceso

Una vez que el servidor esté corriendo, puedes acceder a la documentación en:

```
http://localhost:3000/api-docs
```

### Características de la Documentación

- **Interfaz Interactiva**: Prueba endpoints directamente desde el navegador
- **Autenticación JWT**: Configura tu token Bearer para probar endpoints protegidos
- **Esquemas Completos**: Visualiza todos los modelos de datos
- **Ejemplos**: Cada endpoint incluye ejemplos de request/response
- **Filtrado por Tags**: Organizado por módulos (Autenticación, Usuarios, Cursos, etc.)

## Cómo Usar la Documentación Swagger

### 1. Iniciar el Servidor

```bash
cd edunet-backend
npm run dev
```

### 2. Abrir Swagger UI

Navega a `http://localhost:3000/api-docs` en tu navegador.

### 3. Autenticarse (Para endpoints protegidos)

La mayoría de los endpoints requieren autenticación JWT:

1. **Obtener un Token**:
   - Usa el endpoint `POST /api/auth/login`
   - Click en "Try it out"
   - Ingresa credenciales:
     ```json
     {
       "correo": "usuario@edunet.com",
       "contraseña": "password123"
     }
     ```
   - Click en "Execute"
   - Copia el `token` de la respuesta

2. **Configurar Autenticación**:
   - Click en el botón "Authorize" en la parte superior
   - En el campo "Value", ingresa: `Bearer TU_TOKEN_AQUI`
   - Click en "Authorize"
   - Click en "Close"

3. **Usar Endpoints Protegidos**:
   - Ahora todos los endpoints mostrarán un candado cerrado
   - Puedes probar cualquier endpoint autenticado

### 4. Probar Endpoints

Para cualquier endpoint:
1. Click en el endpoint que deseas probar
2. Click en "Try it out"
3. Completa los parámetros requeridos
4. Click en "Execute"
5. Observa la respuesta en la sección "Response"

## Obtener Especificación OpenAPI (JSON)

Si necesitas la especificación OpenAPI en formato JSON:

```
http://localhost:3000/api-docs.json
```

Esto es útil para:
- Generar clientes API automáticamente
- Importar en herramientas como Postman
- Integración con otras herramientas de desarrollo

## Módulos Documentados

### ✅ Autenticación (`/api/auth`)
- `POST /register` - Registro de usuarios
- `POST /login` - Inicio de sesión
- `POST /forgot-password` - Solicitar restablecimiento de contraseña
- `POST /reset-password` - Restablecer contraseña
- `GET /me` - Información del usuario autenticado

### ✅ Usuarios (`/api/users`)
- `GET /` - Lista de usuarios (Admin)
- `POST /` - Crear usuario
- `GET /{correo}` - Obtener usuario por correo
- `PUT /{correo}` - Actualizar usuario
- `DELETE /{correo}` - Eliminar usuario (Admin)
- `POST /upload-profile` - Subir foto de perfil
- `GET /mis-estudiantes/list` - Estudiantes de un acudiente

### ✅ Profesor (`/api/profesor`)
- `GET /dashboard/{idProfesor}` - Dashboard del profesor
- `GET /perfil/{idProfesor}` - Perfil del profesor
- `PUT /perfil/{idProfesor}` - Actualizar perfil
- `GET /horario/{idProfesor}` - Horario del profesor

### ✅ Cursos (`/api/cursos`)
- `POST /` - Crear curso
- `GET /` - Listar todos los cursos (Admin)
- `GET /profesor/{idProfesor}` - Cursos de un profesor
- `GET /{idCurso}` - Obtener curso por ID
- `PUT /{idCurso}` - Actualizar curso
- `DELETE /{idCurso}` - Eliminar curso
- `GET /{idCurso}/estudiantes` - Estudiantes de un curso
- `POST /{idCurso}/estudiantes` - Agregar estudiante a curso
- `PUT /{idCurso}/estudiante/{idEstudiante}/estado` - Actualizar estado
- `DELETE /{idCurso}/estudiante/{idEstudiante}` - Remover estudiante
- `POST /admin/assign-profesor` - Asignar profesor (Admin)

### 📋 Otros Módulos (Endpoints disponibles en el código)
- **Materias** (`/api/materias`)
- **Calificaciones** (`/api/calificaciones`)
- **Asistencia** (`/api/asistencia`)
- **Clases** (`/api/clases`)
- **Materiales** (`/api/materiales`)
- **Mensajes** (`/api/mensajes`)
- **Eventos** (`/api/eventos`)
- **Reportes** (`/api/reportes`, `/api/admin/reportes`)

## Roles y Permisos

Los roles están definidos por `idRol`:

| Rol | ID | Descripción |
|-----|-----|-------------|
| Estudiante | 1 | Acceso a cursos, materiales, calificaciones |
| Profesor | 2 | Gestión de clases, calificaciones, asistencia |
| Acudiente | 3 | Visualización de información de estudiantes asignados |
| Admin | 4 | Acceso completo a todos los módulos |

## Esquemas de Datos Principales

### Usuario
```json
{
  "idPersona": 123,
  "nombre": "Juan Pérez",
  "correo": "juan.perez@edunet.com",
  "contraseña": "hashedPassword",
  "telefono": "+57 300 123 4567",
  "direccion": "Calle 123 #45-67",
  "fechaNacimiento": "2000-01-15",
  "fotoPerfil": "/uploads/foto.jpg",
  "idRol": 1
}
```

### Curso
```json
{
  "idCurso": 1,
  "nombreCurso": "Matemáticas Avanzadas",
  "descripcion": "Curso de cálculo y álgebra",
  "año": 2024
}
```

### Calificación
```json
{
  "idCalificacion": 1,
  "idEstudiante": 123,
  "idMateria": 5,
  "nota": 4.5,
  "periodo": "2024-1",
  "fecha": "2024-06-15"
}
```

## Formato de Respuestas

### Éxito
```json
{
  "message": "Operación exitosa",
  "data": { /* datos solicitados */ }
}
```

### Error
```json
{
  "error": "Mensaje de error",
  "details": "Detalles adicionales (opcional)"
}
```

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token no válido o ausente |
| 403 | Forbidden - Sin permisos suficientes |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

## Ejemplos de Uso con cURL

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "correo": "usuario@edunet.com",
    "contraseña": "password123"
  }'
```

### Obtener Usuarios (con token)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Crear Curso
```bash
curl -X POST http://localhost:3000/api/cursos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreCurso": "Matemáticas Avanzadas",
    "descripcion": "Curso de cálculo",
    "año": 2024
  }'
```

## Integración con Herramientas

### Postman
1. Importa la especificación desde: `http://localhost:3000/api-docs.json`
2. Postman detectará automáticamente todos los endpoints
3. Configura la autenticación Bearer Token en la colección

### Insomnia
1. Create → Import from URL
2. URL: `http://localhost:3000/api-docs.json`
3. Todos los endpoints se importarán automáticamente

### Cliente TypeScript/JavaScript
Genera un cliente usando herramientas como:
- `openapi-generator`
- `swagger-typescript-api`
- `orval`

## Desarrollo y Mantenimiento

### Agregar Documentación a Nuevos Endpoints

Para documentar un nuevo endpoint, agrega comentarios JSDoc en las rutas:

```typescript
/**
 * @swagger
 * /api/nuevo-endpoint:
 *   get:
 *     summary: Descripción breve
 *     tags: [Categoría]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 */
router.get('/nuevo-endpoint', handler);
```

O crea un archivo en `src/docs/` con la documentación completa.

### Actualizar Esquemas

Los esquemas se definen en `src/config/swagger.ts` bajo `components.schemas`.

### Regenerar Documentación

La documentación se genera automáticamente al iniciar el servidor. No requiere pasos adicionales.

## Soporte

Para preguntas o problemas con la API:
- Revisa esta documentación
- Consulta Swagger UI en `/api-docs`
- Contacta al equipo de desarrollo

---

**Versión**: 1.0.0
**Última Actualización**: Diciembre 2024
