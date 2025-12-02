/**
 * @swagger
 * /api/cursos:
 *   post:
 *     summary: Crear un nuevo curso
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     description: Solo profesores (rol 2) y administradores (rol 4)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Curso'
 *     responses:
 *       201:
 *         description: Curso creado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 *   get:
 *     summary: Obtener todos los cursos
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     description: Solo administradores (rol 4)
 *     responses:
 *       200:
 *         description: Lista de todos los cursos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Curso'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /api/cursos/profesor/{idProfesor}:
 *   get:
 *     summary: Obtener cursos de un profesor
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idProfesor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesor
 *     responses:
 *       200:
 *         description: Lista de cursos del profesor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Curso'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /api/cursos/{idCurso}:
 *   get:
 *     summary: Obtener un curso por ID
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCurso
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Información del curso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Curso'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   put:
 *     summary: Actualizar un curso
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCurso
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Curso'
 *     responses:
 *       200:
 *         description: Curso actualizado exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   delete:
 *     summary: Eliminar un curso
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCurso
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso a eliminar
 *     responses:
 *       200:
 *         description: Curso eliminado exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /api/cursos/{idCurso}/estudiantes:
 *   get:
 *     summary: Obtener estudiantes de un curso
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCurso
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Lista de estudiantes del curso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   post:
 *     summary: Agregar estudiante a un curso
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCurso
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idEstudiante:
 *                 type: integer
 *                 description: ID del estudiante a agregar
 *             required:
 *               - idEstudiante
 *     responses:
 *       201:
 *         description: Estudiante agregado al curso exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /api/cursos/{idCurso}/estudiante/{idEstudiante}/estado:
 *   put:
 *     summary: Actualizar estado de estudiante en curso
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCurso
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idEstudiante
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Activo, Inactivo, Retirado]
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /api/cursos/{idCurso}/estudiante/{idEstudiante}:
 *   delete:
 *     summary: Remover estudiante de un curso
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idCurso
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idEstudiante
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estudiante removido del curso exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * /api/cursos/admin/assign-profesor:
 *   post:
 *     summary: Asignar profesor a un curso (Solo Admin)
 *     tags: [Cursos]
 *     security:
 *       - bearerAuth: []
 *     description: Solo administradores (rol 4)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idCurso:
 *                 type: integer
 *               idProfesor:
 *                 type: integer
 *             required:
 *               - idCurso
 *               - idProfesor
 *     responses:
 *       200:
 *         description: Profesor asignado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
