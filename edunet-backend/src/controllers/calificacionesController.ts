import { Request, Response } from 'express';
import { connection } from '../db/connection';
import { Calificacion } from '../types/calificacion';

export class CalificacionesController {
  // Obtener calificaciones de un curso
  async getCalificacionesCurso(req: Request, res: Response) {
    try {
      const { idCurso } = req.params;
      
      // Validar y convertir idCurso a número
      const id = Number(idCurso);
      if (isNaN(id)) {
        return res.status(400).json({ 
          message: 'ID de curso inválido',
          detail: 'El parámetro idCurso debe ser un número'
        });
      }

      const [rows]: any = await connection.execute(
        `SELECT c.idCalificacion, c.idCurso, c.idEstudiante, 
                c.tipo, c.nombre, c.valor, c.peso,
                c.fecha_asignacion, c.comentarios,
                u.nombres as nombre_estudiante, 
                u.apellidos as apellido_estudiante
         FROM calificaciones c
         INNER JOIN usuarios u ON c.idEstudiante = u.idUsuarios
         WHERE c.idCurso = ?
         ORDER BY u.apellidos, u.nombres, c.fecha_asignacion`,
        [id]
      );

      // Si no hay calificaciones, devolver array vacío (no es error)
      res.json(rows || []);
    } catch (error) {
      console.error('Error en getCalificacionesCurso:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        detail: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener calificaciones de un estudiante en un curso
  async getCalificacionesEstudiante(req: Request, res: Response) {
    try {
      const { idCurso, idEstudiante } = req.params;
      const usuarioSolicitante = req.user;

      // Verificación de acceso
      if (usuarioSolicitante?.rol === 1) { // Estudiante
        if (usuarioSolicitante.id !== Number(idEstudiante)) {
          return res.status(403).json({ message: 'No tiene permiso para ver las calificaciones de otro estudiante' });
        }
      } else if (usuarioSolicitante?.rol === 3) { // Acudiente
        // Verificar relación padre-estudiante
        const [relacion]: any = await connection.execute(
          'SELECT * FROM padre_estudiante WHERE idPadre = ? AND idEstudiante = ?',
          [usuarioSolicitante.id, idEstudiante]
        );
        if (relacion.length === 0) {
          return res.status(403).json({ message: 'Este estudiante no está asociado a su cuenta' });
        }
      }

      const [rows]: any = await connection.execute(
        `SELECT *
         FROM calificaciones
         WHERE idCurso = ? AND idEstudiante = ?
         ORDER BY fecha_asignacion`,
        [idCurso, idEstudiante]
      );
      res.json(rows);
    } catch (error) {
      console.error('Error en getCalificacionesEstudiante:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Registrar una nueva calificación
  async createCalificacion(req: Request, res: Response) {
    try {
      const { idCurso, idEstudiante, tipo, nombre, valor, peso, comentarios } = req.body;
      const fecha_asignacion = new Date();

      const [result]: any = await connection.execute(
        `INSERT INTO calificaciones 
         (idCurso, idEstudiante, tipo, nombre, valor, peso, fecha_asignacion, comentarios)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [idCurso, idEstudiante, tipo, nombre, valor, peso, fecha_asignacion, comentarios]
      );

      res.status(201).json({
        message: 'Calificación registrada correctamente',
        idCalificacion: result.insertId
      });
    } catch (error) {
      console.error('Error en createCalificacion:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Actualizar una calificación
  async updateCalificacion(req: Request, res: Response) {
    try {
      const { idCalificacion } = req.params;
      const { valor, comentarios } = req.body;

      await connection.execute(
        `UPDATE calificaciones
         SET valor = ?, comentarios = ?
         WHERE idCalificacion = ?`,
        [valor, comentarios, idCalificacion]
      );

      res.json({ message: 'Calificación actualizada correctamente' });
    } catch (error) {
      console.error('Error en updateCalificacion:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Eliminar una calificación
  async deleteCalificacion(req: Request, res: Response) {
    try {
      const { idCalificacion } = req.params;

      await connection.execute(
        'DELETE FROM calificaciones WHERE idCalificacion = ?',
        [idCalificacion]
      );

      res.json({ message: 'Calificación eliminada correctamente' });
    } catch (error) {
      console.error('Error en deleteCalificacion:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener promedio del curso
  async getPromedioCurso(req: Request, res: Response) {
    try {
      const { idCurso } = req.params;
      const [rows]: any = await connection.execute(
        `SELECT 
           u.idUsuarios,
           u.nombres,
           u.apellidos,
           ROUND(AVG(c.valor * c.peso / 100), 2) as promedio
         FROM usuarios u
         INNER JOIN curso_estudiante ce ON u.idUsuarios = ce.idEstudiante
         LEFT JOIN calificaciones c ON ce.idEstudiante = c.idEstudiante 
           AND ce.idCurso = c.idCurso
         WHERE ce.idCurso = ? AND ce.estado = 'activo'
         GROUP BY u.idUsuarios, u.nombres, u.apellidos
         ORDER BY promedio DESC`,
        [idCurso]
      );
      res.json(rows);
    } catch (error) {
      console.error('Error en getPromedioCurso:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
