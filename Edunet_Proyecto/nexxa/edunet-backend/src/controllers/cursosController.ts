import { Request, Response } from 'express';
import { connection } from '../db/connection';
import { Curso, CursoEstudiante } from '../types/curso';

interface CreateCursoBody {
  idMateria: number;
  idProfesor: number;
  periodo: string;
  anio: number;
  grado: string;
  seccion: string;
}

export class CursosController {
  // Crear nuevo curso
  async createCurso(req: Request, res: Response) {
    const conn = await connection.getConnection();
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

      await conn.commit();

      res.status(201).json({
        message: 'Curso creado correctamente',
        idCurso: result.insertId
      });

    } catch (error) {
      await conn.rollback();
      console.error('Error en createCurso:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
      conn.release();
    }
  }
  // Obtener todos los cursos de un profesor
  async getCursos(req: Request, res: Response) {
    try {
      const { idProfesor } = req.params;
      const [rows]: any = await connection.execute(
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
    }
  }

  // Obtener detalle de un curso específico
  async getCurso(req: Request, res: Response) {
    try {
      const { idCurso } = req.params;
      const [curso]: any = await connection.execute(
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
      const [estudiantes]: any = await connection.execute(
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
    }
  }

  // Obtener estudiantes de un curso
  async getEstudiantesCurso(req: Request, res: Response) {
    try {
      const { idCurso } = req.params;
      const [rows]: any = await connection.execute(
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
    }
  }

  // Actualizar estado de un estudiante en el curso
  async updateEstadoCursoEstudiante(req: Request, res: Response) {
    const conn = await connection.getConnection();
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
  async updateCurso(req: Request, res: Response) {
    const conn = await connection.getConnection();
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
  async deleteCurso(req: Request, res: Response) {
    const conn = await connection.getConnection();
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
  async addEstudianteCurso(req: Request, res: Response) {
    const conn = await connection.getConnection();
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

      // Verificar que el estudiante existe y tiene rol estudiante
      const [estudiante]: any = await conn.execute(
        `SELECT u.idUsuarios FROM usuarios u
         INNER JOIN roles r ON u.idRol = r.idRol
         WHERE u.idUsuarios = ? AND r.nombreRol = 'estudiante'`,
        [idEstudiante]
      );

      if (!estudiante[0]) {
        await conn.rollback();
        return res.status(404).json({ message: 'Estudiante no encontrado' });
      }

      // Agregar estudiante al curso
      await conn.execute(
        `INSERT INTO curso_estudiante (idCurso, idEstudiante, fechaInscripcion, estado)
         VALUES (?, ?, NOW(), 'activo')`,
        [idCurso, idEstudiante]
      );

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
  async removeEstudianteCurso(req: Request, res: Response) {
    const conn = await connection.getConnection();
    try {
      const { idCurso, idEstudiante } = req.params;

      await conn.beginTransaction();

      // Eliminar calificaciones
      await conn.execute(
        'DELETE FROM calificaciones WHERE idCurso = ? AND idEstudiante = ?',
        [idCurso, idEstudiante]
      );

      // Eliminar asistencias
      await conn.execute(
        `DELETE a FROM asistencia a
         INNER JOIN clases c ON a.idClase = c.idClase
         WHERE c.idCurso = ? AND a.idEstudiante = ?`,
        [idCurso, idEstudiante]
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
}