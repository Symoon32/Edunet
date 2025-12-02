import { Request, Response } from 'express';
import { connectDB } from '../db/connection';
import { Profesor, ProfesorDashboard } from '../types/profesor';

// Obtener dashboard del profesor
export async function getDashboard(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const { idProfesor } = req.params;
    const dashboard: ProfesorDashboard = {
      proximasClases: [],
      cursosActivos: 0,
      estudiantesTotales: 0,
      proximasEntregas: []
    };

    // Obtener próximas clases
    const [clases]: any = await conn.execute(
      `SELECT c.*, m.nombre as materia, h.hora_inicio, h.hora_fin, h.salon
       FROM clases c
       INNER JOIN cursos cu ON c.idCurso = cu.idCurso
       INNER JOIN materias m ON cu.idMateria = m.idMateria
       INNER JOIN horarios h ON cu.idCurso = h.idCurso
       WHERE cu.idProfesor = ? AND c.fecha >= CURDATE()
       ORDER BY c.fecha, h.hora_inicio
       LIMIT 5`,
      [idProfesor]
    );
    dashboard.proximasClases = clases;

    // Obtener conteo de cursos activos
    const [cursos]: any = await conn.execute(
      `SELECT COUNT(DISTINCT idCurso) as total
       FROM cursos
       WHERE idProfesor = ?`,
      [idProfesor]
    );
    dashboard.cursosActivos = cursos[0]?.total || 0;

    // Obtener conteo total de estudiantes
    const [estudiantes]: any = await conn.execute(
      `SELECT COUNT(DISTINCT ce.idEstudiante) as total
       FROM curso_estudiante ce
       INNER JOIN cursos c ON ce.idCurso = c.idCurso
       WHERE c.idProfesor = ? AND ce.estado = 'activo'`,
      [idProfesor]
    );
    dashboard.estudiantesTotales = estudiantes[0]?.total || 0;

    res.json(dashboard);
  } catch (error) {
    console.error('Error en getDashboard:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Obtener perfil del profesor
export async function getPerfil(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const { idProfesor } = req.params;
    const [rows]: any = await conn.execute(`
      SELECT
        u.idUsuarios,
        u.nombres,
        u.apellidos,
        u.correo,
        u.fotoPerfil,
        up.especialidad,
        up.titulo
      FROM usuarios u
      LEFT JOIN usuario_profesor up ON u.idUsuarios = up.idUsuario
      WHERE u.idUsuarios = ? AND u.idRol = (
        SELECT idRol FROM roles WHERE nombreRol = 'profesor'
      )`,
      [idProfesor]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getPerfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}

// Actualizar perfil del profesor
export async function updatePerfil(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const { idProfesor } = req.params;
    const { nombres, apellidos, correo, especialidad, titulo } = req.body;

    // Validación de datos requeridos
    if (!nombres || !apellidos || !especialidad || !titulo) {
      return res.status(400).json({
        message: 'Datos incompletos',
        required: ['nombres', 'apellidos', 'especialidad', 'titulo'],
        received: { nombres, apellidos, especialidad, titulo }
      });
    }

    await conn.beginTransaction();

    // Verificar que el profesor existe y es un profesor
    const [rows]: any = await conn.execute(`
      SELECT
        u.idUsuarios
      FROM usuarios u
      INNER JOIN roles r ON u.idRol = r.idRol
      WHERE u.idUsuarios = ? AND r.nombreRol = 'profesor'
    `, [idProfesor]);

    if (!rows[0]) {
      await conn.rollback();
      return res.status(404).json({
        message: 'Profesor no encontrado',
        details: 'El ID proporcionado no corresponde a un profesor activo'
      });
    }

    // Actualizar datos básicos del usuario
    await conn.execute(`
      UPDATE usuarios
      SET nombres = ?, apellidos = ?
      WHERE idUsuarios = ?
    `, [nombres, apellidos, idProfesor]);

    // Actualizar o insertar datos del profesor
    await conn.execute(`
      INSERT INTO usuario_profesor (idUsuario, especialidad, titulo)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      especialidad = VALUES(especialidad),
      titulo = VALUES(titulo)
    `, [idProfesor, especialidad, titulo]);

    await conn.commit();

    const [updatedData]: any = await conn.execute(`
      SELECT
        u.idUsuarios,
        u.nombres,
        u.apellidos,
        u.correo,
        up.especialidad,
        up.titulo
      FROM usuarios u
      LEFT JOIN usuario_profesor up ON u.idUsuarios = up.idUsuario
      WHERE u.idUsuarios = ?
    `, [idProfesor]);

    res.json({
      message: 'Perfil actualizado correctamente',
      data: updatedData[0]
    });

  } catch (error: any) {
    await conn.rollback();
    console.error('Error en updatePerfil:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  } finally {
    conn.release();
  }
}

// Obtener horario del profesor
export async function getHorario(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const { idProfesor } = req.params;
    const [rows]: any = await conn.execute(
      `SELECT h.*, c.idCurso, m.nombre as materia, m.codigo
       FROM horarios h
       INNER JOIN cursos c ON h.idCurso = c.idCurso
       INNER JOIN materias m ON c.idMateria = m.idMateria
       WHERE c.idProfesor = ?
       ORDER BY h.dia_semana, h.hora_inicio`,
      [idProfesor]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error en getHorario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    conn.release();
  }
}