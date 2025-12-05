import { Request, Response } from 'express';
import { connection } from '../db/connection';

export class MensajesController {
  // Enviar mensaje
  async sendMessage(req: Request, res: Response) {
    try {
      const { idDestinatario, asunto, contenido } = req.body;
      const idRemitente = req.user?.id; // From authMiddleware

      if (!idRemitente) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const [result]: any = await connection.execute(
        `INSERT INTO mensajes (idRemitente, idDestinatario, asunto, contenido)
         VALUES (?, ?, ?, ?)`,
        [idRemitente, idDestinatario, asunto, contenido]
      );

      res.status(201).json({
        message: 'Mensaje enviado correctamente',
        idMensaje: result.insertId
      });
    } catch (error) {
      console.error('Error en sendMessage:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener mensajes recibidos
  async getReceivedMessages(req: Request, res: Response) {
    try {
      const idUsuario = req.user?.id;

      const [rows]: any = await connection.execute(
        `SELECT m.*, u.nombres as nombre_remitente, u.apellidos as apellido_remitente
         FROM mensajes m
         JOIN usuarios u ON m.idRemitente = u.idUsuarios
         WHERE m.idDestinatario = ?
         ORDER BY m.fecha_envio DESC`,
        [idUsuario]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error en getReceivedMessages:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener mensajes enviados
  async getSentMessages(req: Request, res: Response) {
    try {
      const idUsuario = req.user?.id;

      const [rows]: any = await connection.execute(
        `SELECT m.*, u.nombres as nombre_destinatario, u.apellidos as apellido_destinatario
         FROM mensajes m
         JOIN usuarios u ON m.idDestinatario = u.idUsuarios
         WHERE m.idRemitente = ?
         ORDER BY m.fecha_envio DESC`,
        [idUsuario]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error en getSentMessages:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Marcar como leído
  async markAsRead(req: Request, res: Response) {
    try {
      const { idMensaje } = req.params;
      const idUsuario = req.user?.id;

      // Verify ownership (recipient)
      const [rows]: any = await connection.execute(
        'SELECT * FROM mensajes WHERE idMensaje = ? AND idDestinatario = ?',
        [idMensaje, idUsuario]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Mensaje no encontrado o no autorizado' });
      }

      await connection.execute(
        'UPDATE mensajes SET leido = TRUE WHERE idMensaje = ?',
        [idMensaje]
      );

      res.json({ message: 'Mensaje marcado como leído' });
    } catch (error) {
      console.error('Error en markAsRead:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
