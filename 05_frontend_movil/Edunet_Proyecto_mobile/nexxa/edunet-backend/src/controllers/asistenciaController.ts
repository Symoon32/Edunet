import { Request, Response } from 'express';
import { connection } from '../db/connection';

interface Asistencia {
  idEstudiante: number;
  estado: 'presente' | 'ausente' | 'tardanza' | 'justificado';
  observaciones?: string;
}

export class AsistenciaController {
  public async registrarAsistencia(req: Request, res: Response): Promise<void> {
    const conn = await connection.getConnection();
    try {
      const { idClase } = req.params;
      const { asistencias } = req.body;

      if (!Array.isArray(asistencias)) {
        res.status(400).json({
          message: "Formato inválido",
          details: "asistencias debe ser un array"
        });
        return;
      }

      const estadosValidos = ["presente", "ausente", "tardanza", "justificado"];

      const [clase]: any = await conn.execute(
        "SELECT idClase, idCurso, fecha FROM clases WHERE idClase = ?",
        [idClase]
      );

      if (!clase[0]) {
        res.status(404).json({
          message: "Clase no encontrada"
        });
        return;
      }

      await conn.beginTransaction();

      try {
        for (const asistencia of asistencias) {
          if (!estadosValidos.includes(asistencia.estado)) {
            throw new Error(`Estado inválido: ${asistencia.estado}`);
          }

          await conn.execute(
            `INSERT INTO asistencia
             (idClase, idEstudiante, estado, observaciones)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             estado = VALUES(estado),
             observaciones = VALUES(observaciones)`,
            [
              idClase,
              asistencia.idEstudiante,
              asistencia.estado,
              asistencia.observaciones || null
            ]
          );
        }

        await conn.commit();
        res.json({
          message: "Asistencia registrada correctamente",
          registros: asistencias.length
        });
      } catch (error) {
        await conn.rollback();
        throw error;
      }
    } catch (error: any) {
      console.error("Error en registrarAsistencia:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        details: error.message
      });
    } finally {
      conn.release();
    }
  }

  public async getAsistenciaClase(req: Request, res: Response): Promise<void> {
    const conn = await connection.getConnection();
    try {
      const { idClase } = req.params;

      // Verificar que la clase exista
      const [claseRows]: any = await conn.execute(
        'SELECT idClase, idCurso, fecha FROM clases WHERE idClase = ?',
        [idClase]
      );

      if (!claseRows[0]) {
        res.status(404).json({ message: 'Clase no encontrada' });
        return;
      }

      const [asistencias] = await conn.execute(
        `SELECT a.*, u.nombres, u.apellidos
         FROM asistencia a
         JOIN usuarios u ON a.idEstudiante = u.idUsuarios
         WHERE a.idClase = ?
         ORDER BY u.apellidos, u.nombres`,
        [idClase]
      );

      // Información adicional para depuración cuando no hay registros
      const [countRows]: any = await conn.execute(
        'SELECT COUNT(*) as totalAsistencias FROM asistencia WHERE idClase = ?',
        [idClase]
      );

      const [estudiantesCursoRows]: any = await conn.execute(
        'SELECT COUNT(*) as totalEstudiantes FROM curso_estudiante WHERE idCurso = ?',
        [claseRows[0].idCurso]
      );

      res.json({
        data: asistencias,
        meta: {
          clase: claseRows[0],
          totalAsistencias: countRows[0]?.totalAsistencias || 0,
          totalEstudiantes: estudiantesCursoRows[0]?.totalEstudiantes || 0
        }
      });
    } catch (error: any) {
      console.error("Error en getAsistenciaClase:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        details: error.message
      });
    } finally {
      conn.release();
    }
  }

  public async getReporteAsistenciaCurso(req: Request, res: Response): Promise<void> {
    const conn = await connection.getConnection();
    try {
      const { idCurso } = req.params;

      const [reporte] = await conn.execute(
        `SELECT 
          u.idUsuarios as idEstudiante,
          u.nombres,
          u.apellidos,
          COUNT(CASE WHEN a.estado = 'presente' THEN 1 END) as presentes,
          COUNT(CASE WHEN a.estado = "ausente" THEN 1 END) as ausentes,
          COUNT(CASE WHEN a.estado = "tardanza" THEN 1 END) as tardanzas,
          COUNT(CASE WHEN a.estado = "justificado" THEN 1 END) as justificados,
          COUNT(a.idAsistencia) as total_clases
         FROM usuarios u
         JOIN curso_estudiante ec ON u.idUsuarios = ec.idEstudiante
         LEFT JOIN clases c ON c.idCurso = ec.idCurso
         LEFT JOIN asistencia a ON a.idClase = c.idClase AND a.idEstudiante = u.idUsuarios
         WHERE ec.idCurso = ?
         GROUP BY u.idUsuarios, u.nombres, u.apellidos
         ORDER BY u.apellidos, u.nombres`,
        [idCurso]
      );

      res.json(reporte);
    } catch (error: any) {
      console.error("Error en getReporteAsistenciaCurso:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        details: error.message
      });
    } finally {
      conn.release();
    }
  }

  public async updateAsistencia(req: Request, res: Response): Promise<void> {
    const conn = await connection.getConnection();
    try {
      const { idAsistencia } = req.params;
      const { estado, observaciones } = req.body;

      const estadosValidos = ["presente", "ausente", "tardanza", "justificado"];
      if (!estadosValidos.includes(estado)) {
        res.status(400).json({
          message: "Estado inválido",
          details: `El estado debe ser uno de: ${estadosValidos.join(", ")}`
        });
        return;
      }

      await conn.execute(
        `UPDATE asistencia 
         SET estado = ?, observaciones = ?
         WHERE idAsistencia = ?`,
        [estado, observaciones || null, idAsistencia]
      );

      res.json({
        message: "Asistencia actualizada correctamente"
      });
    } catch (error: any) {
      console.error("Error en updateAsistencia:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        details: error.message
      });
    } finally {
      conn.release();
    }
  }

  public async getAsistenciaEstudianteCurso(req: Request, res: Response): Promise<void> {
    const conn = await connection.getConnection();
    try {
      const { idEstudiante, idCurso } = req.params;
      const usuarioSolicitante = req.user;

      // Verificación de acceso
      if (usuarioSolicitante?.rol === 1) { // Estudiante
        if (usuarioSolicitante.id !== Number(idEstudiante)) {
          res.status(403).json({ message: 'No tiene permiso para ver la asistencia de otro estudiante' });
          return;
        }
      } else if (usuarioSolicitante?.rol === 3) { // Acudiente
        // Verificar relación padre-estudiante
        const [relacion]: any = await connection.execute(
          'SELECT * FROM padre_estudiante WHERE idPadre = ? AND idEstudiante = ?',
          [usuarioSolicitante.id, idEstudiante]
        );
        if (relacion.length === 0) {
          res.status(403).json({ message: 'Este estudiante no está asociado a su cuenta' });
          return;
        }
      }

      const [asistencias] = await conn.execute(
        `SELECT 
          a.*,
          c.fecha,
          c.tema,
          c.hora_inicio,
          c.hora_fin
         FROM asistencia a
         JOIN clases c ON a.idClase = c.idClase
         WHERE c.idCurso = ? 
         AND a.idEstudiante = ?
         ORDER BY c.fecha DESC, c.hora_inicio DESC`,
        [idCurso, idEstudiante]
      );

      res.json(asistencias);
    } catch (error: any) {
      console.error("Error en getAsistenciaEstudianteCurso:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        details: error.message
      });
    } finally {
      conn.release();
    }
  }

  public async registrarAsistenciaQr(req: Request, res: Response): Promise<void> {
    const conn = await connection.getConnection();
    try {
      const { qrData } = req.body;

      if (!qrData) {
        res.status(400).json({
          message: "Formato inválido",
          details: "qrData es requerido"
        });
        return;
      }

      const { idClase, idEstudiante, timestamp } = JSON.parse(qrData);

      const [clase]: any = await conn.execute(
        "SELECT idClase, idCurso, fecha, hora_inicio, hora_fin FROM clases WHERE idClase = ?",
        [idClase]
      );

      if (!clase[0]) {
        res.status(404).json({
          message: "Clase no encontrada"
        });
        return;
      }

      const [estudiante]: any = await conn.execute(
        "SELECT idUsuarios FROM usuarios WHERE idUsuarios = ? AND idRol = 1",
        [idEstudiante]
      );

      if (!estudiante[0]) {
        res.status(404).json({
          message: "Estudiante no encontrado"
        });
        return;
      }

      const now = new Date();
      const qrTimestamp = new Date(timestamp);

      if (now.getTime() - qrTimestamp.getTime() > 60000) {
        res.status(400).json({
          message: "Código QR expirado"
        });
        return;
      }

      await conn.execute(
        `INSERT INTO asistencia
         (idClase, idEstudiante, estado, observaciones)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         estado = VALUES(estado),
         observaciones = VALUES(observaciones)`,
        [
          idClase,
          idEstudiante,
          'presente',
          'Asistencia registrada por QR'
        ]
      );

      res.json({
        message: "Asistencia registrada correctamente"
      });
    } catch (error: any) {
      console.error("Error en registrarAsistenciaQr:", error);
      res.status(500).json({
        message: "Error interno del servidor",
        details: error.message
      });
    } finally {
      conn.release();
    }
  }
}
