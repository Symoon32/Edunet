import { Request, Response } from 'express';
import { connectDB } from '../db/connection';
import { Curso, CursoEstudiante } from '../types/curso';
import { logAction } from '../utils/logger';

interface CreateCursoBody {
  idMateria: number;
  idProfesor: number;
  periodo: string;
  anio: number;
  grado: string;
  seccion: string;
}

// Crear nuevo curso
export async function createCurso(req: Request, res: Response) {
  const loggedInUser = req.user;
  if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
  const conn = await connectDB();
  try {
    const { idMateria, idProfesor, periodo, anio, grado, seccion }: CreateCursoBody = req.body;

    // Validar datos requeridos
    if (!idMateria || !idProfesor || !periodo || !anio || !grado || !seccion) {
      return res.status(400).json({
        message: 'Datos incompletos',
        required: ['idMateria', 'idProfesor', 'periodo', 'anio', 'grado', 'seccion']
      });
    }

    await conn.beginTransaction();

    // Verificar que la materia existe
    const [materia]: any = await conn.execute(
      'SELECT idMateria FROM materias WHERE idMateria = ?',
      [idMateria]
    );

    if (!materia[0]) {
      await conn.rollback();
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    // Verificar que el profesor existe y es profesor
    const [profesor]: any = await conn.execute(
      `SELECT u.idUsuarios FROM usuarios u
       INNER JOIN roles r ON u.idRol = r.idRol
       WHERE u.idUsuarios = ? AND r.nombreRol = 'profesor'`,
      [idProfesor]
    );

    if (!profesor[0]) {
      await conn.rollback();
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }

    // Crear el curso (ajustado al esquema existente)
    const [result]: any = await conn.execute(
      `INSERT INTO cursos (idMateria, idProfesor, periodo, anio, grado, seccion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idMateria, idProfesor, periodo, anio, grado, seccion]
    );

    const idCursoCreado = result.insertId;
    await logAction(loggedInUser.id, 'CREATE_CURSO', { cursoId: idCursoCreado, materiaId: idMateria, profesorId: idProfesor });

    await conn.commit();

    res.status(201).json({
      message: 'Curso creado correctamente',
      idCurso: idCursoCreado
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error en createCurso:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Obtener todos los cursos (admin) o de un profesor
export async function getAllCursos(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const [rows]: any = await conn.execute(
      `SELECT c.*, m.nombre as materia, m.codigo,
              u.nombres as nombreProfesor, u.apellidos as apellidoProfesor,
              COUNT(DISTINCT ce.idEstudiante) as totalEstudiantes
       FROM cursos c
       INNER JOIN materias m ON c.idMateria = m.idMateria
       INNER JOIN usuarios u ON c.idProfesor = u.idUsuarios
       LEFT JOIN curso_estudiante ce ON c.idCurso = ce.idCurso
       GROUP BY c.idCurso`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en getAllCursos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Obtener todos los cursos de un profesor
export async function getCursos(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const { idProfesor } = req.params;
    const [rows]: any = await conn.execute(
      `SELECT c.*, m.nombre as materia, m.codigo,
              COUNT(DISTINCT ce.idEstudiante) as totalEstudiantes
       FROM cursos c
       INNER JOIN materias m ON c.idMateria = m.idMateria
       LEFT JOIN curso_estudiante ce ON c.idCurso = ce.idCurso
       WHERE c.idProfesor = ?
       GROUP BY c.idCurso`,
      [idProfesor]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en getCursos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Obtener detalle de un curso específico
export async function getCurso(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const { idCurso } = req.params;
    const [curso]: any = await conn.execute(
      `SELECT c.*, m.nombre as materia, m.codigo, m.descripcion
       FROM cursos c
       INNER JOIN materias m ON c.idMateria = m.idMateria
       WHERE c.idCurso = ?`,
      [idCurso]
    );

    if (!curso[0]) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Obtener lista de estudiantes
    const [estudiantes]: any = await conn.execute(
      `SELECT u.idUsuarios, u.nombres, u.apellidos, u.correo,
              ce.fechaInscripcion, ce.estado
       FROM curso_estudiante ce
       INNER JOIN usuarios u ON ce.idEstudiante = u.idUsuarios
       WHERE ce.idCurso = ?`,
      [idCurso]
    );

    res.json({
      ...curso[0],
      estudiantes
    });
  } catch (error) {
    console.error('Error en getCurso:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Obtener estudiantes de un curso
export async function getEstudiantesCurso(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const { idCurso } = req.params;
    const [rows]: any = await conn.execute(
      `SELECT u.idUsuarios, u.nombres, u.apellidos, u.correo,
              ce.fechaInscripcion, ce.estado,
              COALESCE(AVG(cal.valor), 0) as promedio
       FROM curso_estudiante ce
       INNER JOIN usuarios u ON ce.idEstudiante = u.idUsuarios
       LEFT JOIN calificaciones cal ON ce.idEstudiante = cal.idEstudiante
          AND ce.idCurso = cal.idCurso
       WHERE ce.idCurso = ?
       GROUP BY u.idUsuarios`,
      [idCurso]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error en getEstudiantesCurso:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Actualizar estado de un estudiante en el curso
export async function updateEstadoCursoEstudiante(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const { idCurso, idEstudiante } = req.params;
    const { estado } = req.body;

    if (!['activo', 'inactivo', 'pendiente'].includes(estado)) {
      return res.status(400).json({
        message: 'Estado inválido',
        validStates: ['activo', 'inactivo', 'pendiente']
      });
    }

    const [result]: any = await conn.execute(
      `UPDATE curso_estudiante
       SET estado = ?
       WHERE idCurso = ? AND idEstudiante = ?`,
      [estado, idCurso, idEstudiante]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Estudiante no encontrado en el curso'
      });
    }

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error en updateEstadoCursoEstudiante:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Actualizar curso
export async function updateCurso(req: Request, res: Response) {
  const loggedInUser = req.user;
  if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
  const conn = await connectDB();
  try {
    const { idCurso } = req.params;
    const { periodo, anio, grado, seccion } = req.body;

    await conn.beginTransaction();

    // Verificar que el curso existe
    const [curso]: any = await conn.execute(
      'SELECT idCurso FROM cursos WHERE idCurso = ?',
      [idCurso]
    );

    if (!curso[0]) {
      await conn.rollback();
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Actualizar el curso
    const [result]: any = await conn.execute(
      `UPDATE cursos
       SET periodo = COALESCE(?, periodo),
           anio = COALESCE(?, anio),
           grado = COALESCE(?, grado),
           seccion = COALESCE(?, seccion)
       WHERE idCurso = ?`,
[periodo, anio, grado, seccion, idCurso]
    );

    await logAction(loggedInUser.id, 'UPDATE_CURSO', { cursoId: idCurso, updatedFields: req.body });
    await conn.commit();

    res.json({
      message: 'Curso actualizado correctamente',
      updated: result.affectedRows > 0
    });

  } catch (error) {
    await conn.rollback();
    console.error('Error en updateCurso:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Eliminar curso
export async function deleteCurso(req: Request, res: Response) {
  const loggedInUser = req.user;
  if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
  const conn = await connectDB();
  try {
    const { idCurso } = req.params;

    await conn.beginTransaction();

    // Verificar si hay estudiantes activos
    const [estudiantes]: any = await conn.execute(
      'SELECT COUNT(*) as total FROM curso_estudiante WHERE idCurso = ? AND estado = "activo"',
      [idCurso]
    );

    if (estudiantes[0].total > 0) {
      await conn.rollback();
      return res.status(400).json({
        message: 'No se puede eliminar el curso',
        reason: 'El curso tiene estudiantes activos'
      });
    }

    // Eliminar registros relacionados
    await conn.execute('DELETE FROM calificaciones WHERE idCurso = ?', [idCurso]);
    await conn.execute('DELETE FROM curso_estudiante WHERE idCurso = ?', [idCurso]);
    await conn.execute('DELETE FROM clases WHERE idCurso = ?', [idCurso]);

    // Eliminar el curso
    const [result]: any = await conn.execute(
      'DELETE FROM cursos WHERE idCurso = ?',
      [idCurso]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    await conn.commit();
      await logAction(loggedInUser.id, 'DELETE_CURSO', { cursoId: idCurso });
    res.json({ message: 'Curso eliminado correctamente' });

  } catch (error) {
    await conn.rollback();
    console.error('Error en deleteCurso:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Agregar estudiante a curso
export async function addEstudianteCurso(req: Request, res: Response) {
  const loggedInUser = req.user;
  if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
  const conn = await connectDB();
  try {
    const { idCurso } = req.params;
    const { idEstudiante } = req.body;

    await conn.beginTransaction();

    // Verificar que el curso existe
    const [cursoExist]: any = await conn.execute(
      'SELECT idCurso FROM cursos WHERE idCurso = ?',
      [idCurso]
    );

    if (!cursoExist[0]) {
      await conn.rollback();
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    // Verificar que el estudiante existe y tiene rol estudiante (idRol = 1)
    const [estudiante]: any = await conn.execute(
      `SELECT u.idUsuarios FROM usuarios u
       WHERE u.idUsuarios = ? AND u.idRol = 1`,
      [idEstudiante]
    );

    if (!estudiante[0]) {
      await conn.rollback();
      return res.status(404).json({ message: 'Estudiante no encontrado o no tiene el rol de estudiante' });
    }

    // Agregar estudiante al curso
    // Usamos CURRENT_TIMESTAMP para compatibilidad entre MySQL y SQLite
    await conn.execute(
      `INSERT INTO curso_estudiante (idCurso, idEstudiante, fechaInscripcion, estado)
       VALUES (?, ?, CURRENT_TIMESTAMP, 'activo')`,
      [idCurso, idEstudiante]
    );

    await logAction(loggedInUser.id, 'ADD_STUDENT_TO_CURSO', { cursoId: idCurso, studentId: idEstudiante });
    await conn.commit();
    res.status(201).json({ message: 'Estudiante agregado al curso correctamente' });

  } catch (error: any) {
    await conn.rollback();
    if (error && error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'El estudiante ya está inscrito en este curso'
      });
    }
    console.error('Error en addEstudianteCurso:', error);
    // Exponer mensaje de error para diagnóstico (se puede reducir en producción)
    return res.status(500).json({ message: 'Error interno del servidor', details: error instanceof Error ? error.message : String(error) });
  } finally {
    conn.release();
  }
}

// Eliminar estudiante de curso
export async function removeEstudianteCurso(req: Request, res: Response) {
  const loggedInUser = req.user;
  if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
  const conn = await connectDB();
  try {
    const { idCurso, idEstudiante } = req.params;

    await conn.beginTransaction();

    // Eliminar calificaciones
    await conn.execute(
      'DELETE FROM calificaciones WHERE idCurso = ? AND idEstudiante = ?',
      [idCurso, idEstudiante]
    );

    // Eliminar asistencias
    // Usamos una subconsulta para compatibilidad entre MySQL y SQLite
    await conn.execute(
      `DELETE FROM asistencia
       WHERE idEstudiante = ?
       AND idClase IN (SELECT idClase FROM clases WHERE idCurso = ?)`,
      [idEstudiante, idCurso]
    );

    // Eliminar inscripción
    const [result]: any = await conn.execute(
      'DELETE FROM curso_estudiante WHERE idCurso = ? AND idEstudiante = ?',
      [idCurso, idEstudiante]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({
        message: 'Estudiante no encontrado en el curso'
      });
    }

    await logAction(loggedInUser.id, 'REMOVE_STUDENT_FROM_CURSO', { cursoId: idCurso, studentId: idEstudiante });
    await conn.commit();
    res.json({ message: 'Estudiante eliminado del curso correctamente' });

  } catch (error) {
    await conn.rollback();
    console.error('Error en removeEstudianteCurso:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

export async function assignProfesorToCurso(req: Request, res: Response) {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
    const { idCurso, idProfesor, idMateria } = req.body;
    const conn = await connectDB();
    try {
        const sql = 'UPDATE cursos SET idProfesor = ?, idMateria = ? WHERE idCurso = ?';
        await conn.execute(sql, [idProfesor, idMateria, idCurso]);
        await logAction(loggedInUser.id, 'ASSIGN_PROFESOR_TO_CURSO', { cursoId: idCurso, profesorId: idProfesor, materiaId: idMateria });
        res.json({ message: 'Profesor asignado al curso' });
    } catch (err) {
        res.status(500).json({ error: 'Error al asignar profesor al curso', details: err });
    } finally {
        conn.release();
    }
}
