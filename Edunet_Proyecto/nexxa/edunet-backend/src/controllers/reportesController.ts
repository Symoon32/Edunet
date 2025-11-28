import { Request, Response } from 'express';
import { connection } from '../db/connection';

export class ReportesController {
  // Generar reporte de rendimiento
  async generarReporteRendimiento(req: Request, res: Response) {
    try {
      const { idCurso } = req.params;
      const { periodo } = req.body;

  const [datos]: any = await connection.execute(
        `SELECT 
           u.idUsuarios,
           u.nombre,
           u.apellido,
           COUNT(DISTINCT cal.idCalificacion) as total_evaluaciones,
           ROUND(AVG(cal.valor), 2) as promedio,
           MIN(cal.valor) as nota_minima,
           MAX(cal.valor) as nota_maxima,
           COUNT(DISTINCT CASE WHEN cal.valor < 60 THEN cal.idCalificacion END) as reprobadas
         FROM usuarios u
         INNER JOIN curso_estudiante ce ON u.idUsuarios = ce.idEstudiante
         LEFT JOIN calificaciones cal ON ce.idEstudiante = cal.idEstudiante 
           AND ce.idCurso = cal.idCurso
         WHERE ce.idCurso = ? AND ce.estado = 'activo'
         GROUP BY u.idUsuarios
         ORDER BY promedio DESC`,
        [idCurso]
      );

      const reporte = {
        tipo: 'rendimiento',
        fecha_generacion: new Date(),
        periodo,
        contenido: datos
      };

      // req.user viene del middleware de autenticación y contiene { id, correo, rol }
      const idProfesor = req.user?.id;
  const [result]: any = await connection.execute(
        `INSERT INTO reportes (idProfesor, idCurso, tipo, fecha_generacion, periodo, contenido)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [idProfesor, idCurso, 'rendimiento', reporte.fecha_generacion, periodo, JSON.stringify(reporte.contenido)]
      );

      res.json({
        message: 'Reporte generado correctamente',
        idReporte: result.insertId,
        reporte
      });
    } catch (error) {
      console.error('Error en generarReporteRendimiento:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener reporte específico
  async getReporte(req: Request, res: Response) {
    try {
      const { idReporte } = req.params;
  const [rows]: any = await connection.execute(
        `SELECT *
         FROM reportes
         WHERE idReporte = ?`,
        [idReporte]
      );

      if (!rows[0]) {
        return res.status(404).json({ message: 'Reporte no encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error en getReporte:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Listar reportes de un curso
  async getReportesCurso(req: Request, res: Response) {
    try {
      const { idCurso } = req.params;
  const [rows]: any = await connection.execute(
        `SELECT *
         FROM reportes
         WHERE idCurso = ?
         ORDER BY fecha_generacion DESC`,
        [idCurso]
      );
      res.json(rows);
    } catch (error) {
      console.error('Error en getReportesCurso:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Eliminar reporte
  async deleteReporte(req: Request, res: Response) {
    try {
      const { idReporte } = req.params;

      await connection.execute(
        'DELETE FROM reportes WHERE idReporte = ?',
        [idReporte]
      );

      res.json({ message: 'Reporte eliminado correctamente' });
    } catch (error) {
      console.error('Error en deleteReporte:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
