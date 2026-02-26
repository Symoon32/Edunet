import { Request, Response } from 'express';
import { connection } from '../db/connection';

export class MaterialesController {
  // Publicar material (Profesor/Admin)
  async createMaterial(req: Request, res: Response) {
    try {
      const { idCurso, titulo, descripcion, tipo } = req.body;
      let { url_archivo } = req.body;

      // Si se subió un archivo a través de multer
      if (req.file) {
        const file = req.file as any;
        url_archivo = file.location ? file.location : `/uploads/${file.filename}`;
      }

      const [result]: any = await connection.execute(
        `INSERT INTO materiales (idCurso, titulo, descripcion, url_archivo, tipo)
         VALUES (?, ?, ?, ?, ?)`,
        [idCurso, titulo, descripcion, url_archivo, tipo]
      );

      res.status(201).json({
        message: 'Material publicado correctamente',
        idMaterial: result.insertId
      });
    } catch (error) {
      console.error('Error en createMaterial:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Obtener materiales de un curso (Estudiante/Profesor/Admin)
  async getMaterialesCurso(req: Request, res: Response) {
    try {
      const { idCurso } = req.params;

      const [rows]: any = await connection.execute(
        `SELECT * FROM materiales WHERE idCurso = ? ORDER BY fecha_publicacion DESC`,
        [idCurso]
      );

      res.json(rows);
    } catch (error) {
      console.error('Error en getMaterialesCurso:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  // Eliminar material
  async deleteMaterial(req: Request, res: Response) {
    try {
      const { idMaterial } = req.params;

      await connection.execute(
        'DELETE FROM materiales WHERE idMaterial = ?',
        [idMaterial]
      );

      res.json({ message: 'Material eliminado correctamente' });
    } catch (error) {
      console.error('Error en deleteMaterial:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
