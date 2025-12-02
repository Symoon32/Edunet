/**
 * @swagger
 * /api/profesor/dashboard/{idProfesor}:
 *   get:
 *     summary: Obtener dashboard del profesor
 *     tags: [Profesor]
 *     security:
 *       - bearerAuth: []
 *     description: Solo profesores (rol 2)
 *     parameters:
 *       - in: path
 *         name: idProfesor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesor
 *     responses:
 *       200:
 *         description: Información del dashboard del profesor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCursos:
 *                   type: integer
 *                   description: Total de cursos asignados
 *                 totalEstudiantes:
 *                   type: integer
 *                   description: Total de estudiantes
 *                 clasesHoy:
 *                   type: integer
 *                   description: Número de clases hoy
 *                 proximasClases:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Clase'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /api/profesor/perfil/{idProfesor}:
 *   get:
 *     summary: Obtener perfil del profesor
 *     tags: [Profesor]
 *     security:
 *       - bearerAuth: []
 *     description: Solo profesores (rol 2)
 *     parameters:
 *       - in: path
 *         name: idProfesor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesor
 *     responses:
 *       200:
 *         description: Información del perfil del profesor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idProfesor:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 correo:
 *                   type: string
 *                 especialidad:
 *                   type: string
 *                 telefono:
 *                   type: string
 *                 fotoPerfil:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 *   put:
 *     summary: Actualizar perfil del profesor
 *     tags: [Profesor]
 *     security:
 *       - bearerAuth: []
 *     description: Solo profesores (rol 2)
 *     parameters:
 *       - in: path
 *         name: idProfesor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               especialidad:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *
 * /api/profesor/horario/{idProfesor}:
 *   get:
 *     summary: Obtener horario del profesor
 *     tags: [Profesor]
 *     security:
 *       - bearerAuth: []
 *     description: Solo profesores (rol 2)
 *     parameters:
 *       - in: path
 *         name: idProfesor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del profesor
 *     responses:
 *       200:
 *         description: Horario del profesor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   dia:
 *                     type: string
 *                     enum: [Lunes, Martes, Miércoles, Jueves, Viernes, Sábado]
 *                   horaInicio:
 *                     type: string
 *                     format: time
 *                   horaFin:
 *                     type: string
 *                     format: time
 *                   materia:
 *                     type: string
 *                   salon:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
