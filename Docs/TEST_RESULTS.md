# Reporte de Pruebas: Módulo Administrativo

## Resumen
Se han realizado pruebas exhaustivas sobre las APIs del módulo administrativo ("Admin") para verificar su correcta integración con el frontend y la persistencia en la base de datos.

## Pruebas Realizadas

### 1. Autenticación y Roles
- **Prueba:** Inicio de sesión como Administrador (Rector).
- **Resultado:** **EXITOSO**. Se obtuvo token JWT válido con rol 4.
- **Validación:** Se verificó la capacidad de crear usuarios (Estudiante, Profesor) y que estos nuevos usuarios pudieran iniciar sesión.

### 2. Gestión de Anuncios (Eventos)
- **Endpoint:** `POST /api/eventos`
- **Frontend Component:** `AnunciosComponent`
- **Prueba:** Creación de una noticia ("Reunión de Profesores").
- **Resultado:** **EXITOSO**.
- **Detalle:** Se confirmó que el backend requiere el campo `fecha_inicio`. El frontend envía este campo correctamente. Se validó la inserción en la base de datos SQLite y la respuesta 201.

### 3. Configuración de Cursos
- **Endpoint:** `POST /api/cursos`
- **Frontend Component:** `ConfigurarCursosComponent`
- **Prueba:** Creación de un curso ("Matemáticas Avanzadas") asignando Materia y Profesor.
- **Resultado:** **EXITOSO**.
- **Detalle:** Se confirmó que el backend valida la existencia de `idMateria`, `idProfesor`, `periodo`, `anio`, `grado` y `seccion`. Se verificó que el curso se crea correctamente en la base de datos y devuelve el ID generado.

### 4. Reportes
- **Endpoint:** `GET /api/admin/reportes/users-by-role/:idRol`
- **Frontend Component:** `ReportesComponent`
- **Prueba:** Obtención del listado de profesores (Rol 2).
- **Resultado:** **EXITOSO**.
- **Detalle:** La API retornó la lista correcta de usuarios filtrados por rol, validando la integridad de los datos consultados.

## Conclusión
El módulo de administración funciona correctamente. Las APIs responden según lo esperado y los datos se persisten adecuadamente en la base de datos. La integración con el frontend es consistente con los esquemas de datos validados.
