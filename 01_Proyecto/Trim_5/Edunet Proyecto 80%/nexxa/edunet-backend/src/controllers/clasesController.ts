import { Request, Response } from 'express';
import { connection } from '../db/connection';

export class ClasesController {
  // Crear nueva clase
  async createClase(req: Request, res: Response) {
    try {
      const { idCurso, fecha, hora_inicio, hora_fin, tema, descripcion } = req.body;

      const [result]: any = await connection.execute(
        `INSERT INTO clases (idCurso, fecha, hora_inicio, hora_fin, tema, descripcion, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'programada')`,
        [idCurso, fecha, hora_inicio, hora_fin, tema, descripcion]
      );

      res.status(201).json({
        message: 'Clase creada correctamente',
        idClase: result.insertId
      });
    } catch (error) {
      console.error('Error en createClase:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener clases de un curso
  async getClasesCurso(req: Request, res: Response) {
    try {
      const { idCurso } = req.params;
      const { fecha_inicio, fecha_fin } = req.query;

      // Validate idCurso
      const id = Number(idCurso);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'idCurso inválido' });
      }

      // Ensure we never pass `undefined` as a bind parameter. Use null when no
      // fecha_inicio is provided so the `? IS NULL` check in SQL works.
      const start = (fecha_inicio ?? null) as string | null;
      const end = (fecha_fin ?? null) as string | null;

      // Select explicit columns and include them in GROUP BY to avoid
      // ONLY_FULL_GROUP_BY SQL errors when using aggregates alongside non-aggregated columns.
      const [rows]: any = await connection.execute(
        `SELECT c.idClase, c.idCurso, c.fecha, c.hora_inicio, c.hora_fin, c.tema, c.descripcion, c.estado,
                COUNT(DISTINCT a.idEstudiante) AS total_asistentes,
                COUNT(DISTINCT ce.idEstudiante) AS total_estudiantes
         FROM clases c
         LEFT JOIN asistencia a ON c.idClase = a.idClase AND a.estado = 'presente'
         LEFT JOIN curso_estudiante ce ON c.idCurso = ce.idCurso AND ce.estado = 'activo'
         WHERE c.idCurso = ?
           AND (c.fecha BETWEEN ? AND ? OR ? IS NULL)
         GROUP BY c.idClase, c.idCurso, c.fecha, c.hora_inicio, c.hora_fin, c.tema, c.descripcion, c.estado
         ORDER BY c.fecha DESC, c.hora_inicio`,
        // If start/end are null, replace with wide defaults for the BETWEEN
        [id, start ?? '1900-01-01', end ?? '2100-12-31', start]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error en getClasesCurso:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener detalle de una clase
  async getClase(req: Request, res: Response) {
    try {
      const { idClase } = req.params;
      const [clase]: any = await connection.execute(
        `SELECT c.*, cu.idProfesor, m.nombre as materia
         FROM clases c
         INNER JOIN cursos cu ON c.idCurso = cu.idCurso
         INNER JOIN materias m ON cu.idMateria = m.idMateria
         WHERE c.idClase = ?`,
        [idClase]
      );

      if (!clase[0]) {
        return res.status(404).json({ message: 'Clase no encontrada' });
      }

      // Obtener asistencia
      const [asistencia]: any = await connection.execute(
        `SELECT a.*, u.nombres, u.apellidos
         FROM asistencia a
         INNER JOIN usuarios u ON a.idEstudiante = u.idUsuarios
         WHERE a.idClase = ?`,
        [idClase]
      );

      res.json({
        ...clase[0],
        asistencia
      });
    } catch (error) {
      console.error('Error en getClase:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Actualizar clase
  async updateClase(req: Request, res: Response) {
    try {
      const { idClase } = req.params;
      const { fecha, hora_inicio, hora_fin, tema, descripcion, estado } = req.body;

      await connection.execute(
        `UPDATE clases
         SET fecha = ?, hora_inicio = ?, hora_fin = ?, 
             tema = ?, descripcion = ?, estado = ?
         WHERE idClase = ?`,
        [fecha, hora_inicio, hora_fin, tema, descripcion, estado, idClase]
      );

      res.json({ message: 'Clase actualizada correctamente' });
    } catch (error) {
      console.error('Error en updateClase:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Eliminar clase
  async deleteClase(req: Request, res: Response) {
    try {
  const { idClase } = req.params;

  const conn = await connection.getConnection();
      try {
        await conn.beginTransaction();

        // Eliminar registros de asistencia
        await conn.execute(
          'DELETE FROM asistencia WHERE idClase = ?',
          [idClase]
        );

        // Eliminar la clase
        await conn.execute(
          'DELETE FROM clases WHERE idClase = ?',
          [idClase]
        );

        await conn.commit();
        res.json({ message: 'Clase eliminada correctamente' });
      } catch (txErr) {
        await conn.rollback();
        throw txErr;
      } finally {
        conn.release();
      }
    } catch (error) {
      console.error('Error en deleteClase:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}