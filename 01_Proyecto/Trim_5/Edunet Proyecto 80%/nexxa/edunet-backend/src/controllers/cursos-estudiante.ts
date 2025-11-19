import { Request, Response } from 'express';
import { connection } from '../db/connection';

export class CursosEstudianteController {
  // Obtener cursos del estudiante autenticado
  async getMisCursos(req: Request, res: Response) {
    try {
      const idEstudiante = req.user?.id;

      const [cursos]: any = await connection.execute(
        `SELECT c.*, m.nombre as materia, m.codigo,
                u.nombres as nombreProfesor, u.apellidos as apellidosProfesor,
                ce.estado, ce.fechaInscripcion
         FROM curso_estudiante ce
         INNER JOIN cursos c ON ce.idCurso = c.idCurso
         INNER JOIN materias m ON c.idMateria = m.idMateria
         INNER JOIN usuarios u ON c.idProfesor = u.idUsuarios
         WHERE ce.idEstudiante = ?`,
        [idEstudiante]
      );

      res.json(cursos);
    } catch (error) {
      console.error('Error en getMisCursos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener clases de un curso específico para el estudiante
  async getClasesCursoEstudiante(req: Request, res: Response) {
    try {
      const idEstudiante = req.user?.id;
      const { idCurso } = req.params;

      // Verificar que el estudiante está inscrito en el curso
      const [inscripcion]: any = await connection.execute(
        'SELECT estado FROM curso_estudiante WHERE idCurso = ? AND idEstudiante = ?',
        [idCurso, idEstudiante]
      );

      if (!inscripcion[0]) {
        return res.status(403).json({ 
          message: 'No tienes acceso a este curso' 
        });
      }

      // Obtener las clases
      // Obtener las clases
      const [clases]: any = await connection.execute(
        `SELECT *
         FROM clases
         WHERE idCurso = ?
         ORDER BY fecha DESC, hora_inicio`,
        [idCurso]
      );

      res.json(clases);
    } catch (error) {
      console.error('Error en getClasesCursoEstudiante:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
}