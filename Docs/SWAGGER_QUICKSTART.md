# Guía Rápida: Swagger UI - Edunet API

## Inicio Rápido (5 minutos)

### 1. Iniciar el Servidor
```bash
cd edunet-backend
npm run dev
```

Deberías ver:
```
Servidor corriendo en http://localhost:3000
```

### 2. Abrir Swagger UI
Abre tu navegador y navega a:
```
http://localhost:3000/api-docs
```

¡Verás la interfaz completa de Swagger UI con todos los endpoints documentados!

### 3. Probar tu Primer Endpoint (Login)

#### Paso 1: Expandir el endpoint
- Click en `Autenticación` (tag)
- Click en `POST /api/auth/login`

#### Paso 2: Probar el endpoint
1. Click en **"Try it out"**
2. Verás un editor JSON
3. Usa estas credenciales de prueba:
   ```json
   {
     "correo": "admin@edunet.com",
     "contraseña": "admin123"
   }
   ```
4. Click en **"Execute"**

#### Paso 3: Ver la respuesta
Desplázate hacia abajo y verás:
- **Request URL**: La URL completa llamada
- **Server response**:
  - Code: `200` (éxito)
  - Response body: Un JSON con tu token JWT

Ejemplo de respuesta:
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "idPersona": 1,
    "correo": "admin@edunet.com",
    "nombre": "Administrador",
    "idRol": 4
  }
}
```

### 4. Autenticarse para Endpoints Protegidos

#### Copiar el Token
Del paso anterior, copia el valor de `token` (todo el texto largo).

#### Configurar Autorización
1. En la parte superior de Swagger UI, busca el botón **"Authorize"** (con un candado)
2. Click en **"Authorize"**
3. En el campo que dice "Value", escribe:
   ```
   Bearer TU_TOKEN_COPIADO_AQUI
   ```
   Importante: Debe comenzar con "Bearer " (con espacio)

   Ejemplo:
   ```
   Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Click en **"Authorize"**
5. Click en **"Close"**

¡Listo! Ahora puedes acceder a todos los endpoints protegidos.

### 5. Probar un Endpoint Protegido

Vamos a obtener la lista de usuarios (requiere ser Admin):

1. Expande el tag **"Usuarios"**
2. Click en `GET /api/users`
3. Click en **"Try it out"**
4. Click en **"Execute"**

Verás la lista completa de usuarios en el sistema.

## Casos de Uso Comunes

### 📋 Ver todos los endpoints disponibles
- Navega por los tags en la barra lateral izquierda
- Cada tag agrupa endpoints relacionados

### 🔍 Buscar un endpoint específico
- Usa Ctrl+F (Cmd+F en Mac) en Swagger UI
- O navega por tags

### 📤 Subir un archivo (Foto de perfil)
1. Expande `POST /api/users/upload-profile`
2. Click en "Try it out"
3. Click en "Choose File" y selecciona una imagen
4. Click en "Execute"
5. Obtendrás la URL del archivo subido

### 📊 Ver esquemas de datos
- Scroll hacia abajo en Swagger UI
- Sección "Schemas" muestra todos los modelos
- Click en cualquier modelo para ver sus campos

## Atajos y Tips

### Copiar cURL
Cada endpoint tiene un botón "cURL". Click ahí para copiar el comando cURL completo que puedes usar en terminal.

### Descargar Respuesta
Puedes descargar las respuestas como JSON usando el botón "Download" en cada respuesta.

### Cambiar Servidor
Si quieres probar contra producción:
1. En la parte superior, verás "Servers"
2. Selecciona el servidor que desees

### Ver Especificación OpenAPI
```
http://localhost:3000/api-docs.json
```

## Ejemplos Rápidos por Módulo

### Autenticación
- **Registrar usuario**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Recuperar contraseña**: `POST /api/auth/forgot-password`

### Gestión de Usuarios (Admin)
- **Listar usuarios**: `GET /api/users`
- **Crear usuario**: `POST /api/users`
- **Actualizar usuario**: `PUT /api/users/{correo}`
- **Eliminar usuario**: `DELETE /api/users/{correo}`

### Profesor
- **Dashboard**: `GET /api/profesor/dashboard/{idProfesor}`
- **Ver horario**: `GET /api/profesor/horario/{idProfesor}`
- **Actualizar perfil**: `PUT /api/profesor/perfil/{idProfesor}`

### Cursos
- **Crear curso**: `POST /api/cursos`
- **Mis cursos**: `GET /api/cursos/profesor/{idProfesor}`
- **Agregar estudiante**: `POST /api/cursos/{idCurso}/estudiantes`

## Solución de Problemas

### No veo ningún endpoint
- Verifica que el servidor esté corriendo
- Refresca la página (F5)
- Revisa la consola del navegador (F12)

### Error 401 en todos los endpoints
- Tu token expiró, vuelve a hacer login
- Asegúrate de haber presionado "Authorize" con el token correcto
- Verifica que el token comience con "Bearer "

### Error 403 (Forbidden)
- No tienes los permisos necesarios
- Verifica tu rol de usuario
- Algunos endpoints son solo para Admin (rol 4)

### El endpoint no aparece documentado
- Puede que aún no esté documentado
- Revisa el código fuente en `src/routes/`
- Consulta con el equipo de desarrollo

## Datos de Prueba

Si necesitas usuarios de prueba, puedes usar:

**Admin:**
```json
{
  "correo": "admin@edunet.com",
  "contraseña": "admin123"
}
```

**Profesor:**
```json
{
  "correo": "profesor@edunet.com",
  "contraseña": "profesor123"
}
```

**Estudiante:**
```json
{
  "correo": "estudiante@edunet.com",
  "contraseña": "estudiante123"
}
```

*Nota: Estos usuarios deben existir en tu base de datos. Si no existen, créalos usando el endpoint de registro.*

## Integración con Otras Herramientas

### Importar a Postman
1. En Postman: File → Import
2. Selecciona "Link"
3. Pega: `http://localhost:3000/api-docs.json`
4. Click "Continue" → "Import"

### Importar a Insomnia
1. En Insomnia: Create → Import from URL
2. Pega: `http://localhost:3000/api-docs.json`
3. Click "Fetch and Import"

## Siguientes Pasos

1. ✅ Prueba todos los endpoints de autenticación
2. ✅ Familiarízate con los endpoints de tu rol
3. ✅ Revisa los esquemas de datos disponibles
4. ✅ Lee la documentación completa en `API_DOCUMENTATION.md`
5. ✅ Integra con tu herramienta favorita (Postman/Insomnia)

## Recursos Adicionales

- [Documentación completa de la API](./API_DOCUMENTATION.md)
- [Especificación OpenAPI](http://localhost:3000/api-docs.json)
- [Swagger UI Documentation](https://swagger.io/docs/open-source-tools/swagger-ui/)

---

¿Preguntas? Contacta al equipo de desarrollo.
