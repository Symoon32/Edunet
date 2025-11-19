import { Request, Response } from 'express';
import { connection } from '../db/connection';

interface ProfesorUpdateRequest {
  nombres: string;
  apellidos: string;
  correo?: string;
  especialidad: string;
  titulo: string;
}

export async function updatePerfil(req: Request, res: Response) {
  try {
    const { idProfesor } = req.params;
    const { nombres, apellidos, correo, especialidad, titulo } = req.body as ProfesorUpdateRequest;
    
    console.log('updatePerfil: Request received', {
      params: { idProfesor },
      body: { nombres, apellidos, correo, especialidad, titulo }
    });
    
    // Validación de datos requeridos
    if (!nombres || !apellidos || !especialidad || !titulo) {
      return res.status(400).json({
        message: 'Datos incompletos',
        required: ['nombres', 'apellidos', 'especialidad', 'titulo'],
        received: { nombres, apellidos, especialidad, titulo }
      });
    }

    const conn = await connection.getConnection();
    
    try {
      await conn.beginTransaction();
      console.log('updatePerfil: Transaction started');

      // Verificar que el profesor existe y es un profesor
      const [profesor]: any = await conn.execute(`
        SELECT u.idUsuarios, u.nombres, u.apellidos, r.nombreRol 
        FROM usuarios u
        INNER JOIN roles r ON u.idRol = r.idRol
        WHERE u.idUsuarios = ? AND r.nombreRol = 'profesor'
      `, [idProfesor]);

      if (!profesor[0]) {
        await conn.rollback();
        return res.status(404).json({
          message: 'Profesor no encontrado',
          details: 'El ID proporcionado no corresponde a un profesor activo'
        });
      }

      // Actualizar datos básicos del usuario
      const [userResult]: any = await conn.execute(`
        UPDATE usuarios 
        SET nombres = ?, apellidos = ?
        WHERE idUsuarios = ?
      `, [nombres, apellidos, idProfesor]);

      if (userResult.affectedRows === 0) {
        await conn.rollback();
        return res.status(404).json({
          message: 'Error al actualizar usuario',
          details: 'No se pudo actualizar el registro del usuario'
        });
      }

      // Verificar si existe registro en usuario_profesor
      const [existingProfesor]: any = await conn.execute(`
        SELECT idUsuario FROM usuario_profesor WHERE idUsuario = ?
      `, [idProfesor]);

      if (existingProfesor[0]) {
        // Actualizar datos del profesor
        await conn.execute(`
          UPDATE usuario_profesor 
          SET especialidad = ?, titulo = ?
          WHERE idUsuario = ?
        `, [especialidad, titulo, idProfesor]);
      } else {
        // Insertar nuevo registro de profesor
        await conn.execute(`
          INSERT INTO usuario_profesor (idUsuario, especialidad, titulo)
          VALUES (?, ?, ?)
        `, [idProfesor, especialidad, titulo]);
      }

      await conn.commit();
      
      res.json({
        message: 'Perfil actualizado correctamente',
        data: {
          idProfesor,
          nombres,
          apellidos,
          especialidad,
          titulo
        }
      });
      
    } catch (error: any) {
      await conn.rollback();
      
      console.error('Error en operación de base de datos:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      });

      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          message: 'Error de referencia',
          details: 'El ID del profesor no es válido'
        });
      }

      throw error;
    } finally {
      conn.release();
    }
  } catch (error: any) {
    console.error('Error en updatePerfil:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    
    res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}