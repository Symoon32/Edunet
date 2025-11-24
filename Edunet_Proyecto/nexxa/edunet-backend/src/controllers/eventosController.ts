import { Request, Response } from 'express';
import { connection } from '../db/connection';

export class EventosController {
  // Crear evento (Admin/Profesor)
  async createEvento(req: Request, res: Response) {
    try {
      const { titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios } = req.body;

      const [result]: any = await connection.execute(
        `INSERT INTO eventos (titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios]
      );

      res.status(201).json({
        message: 'Evento creado correctamente',
        idEvento: result.insertId
      });
    } catch (error) {
      console.error('Error en createEvento:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener eventos
  async getEventos(req: Request, res: Response) {
    try {
      // Filtros opcionales
      const { tipo, destinatarios } = req.query;
      let query = 'SELECT * FROM eventos WHERE 1=1';
      const params = [];

      if (tipo) {
        query += ' AND tipo = ?';
        params.push(tipo);
      }
      // Simplificación: no filtramos estrictamente por rol del usuario, pero el frontend puede hacerlo.
      // Idealmente, filtraríamos por "destinatarios" IN ('todos', 'mi_rol')

      query += ' ORDER BY fecha_inicio DESC';

      const [rows]: any = await connection.execute(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error en getEventos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Eliminar evento
  async deleteEvento(req: Request, res: Response) {
    try {
      const { idEvento } = req.params;

      await connection.execute(
        'DELETE FROM eventos WHERE idEvento = ?',
        [idEvento]
      );

      res.json({ message: 'Evento eliminado correctamente' });
    } catch (error) {
      console.error('Error en deleteEvento:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
