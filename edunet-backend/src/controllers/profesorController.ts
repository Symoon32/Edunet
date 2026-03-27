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
    // Usamos CURRENT_DATE para compatibilidad entre MySQL y SQLite
    const [clases]: any = await conn.execute(
      `SELECT c.*, m.nombre as materia, h.hora_inicio, h.hora_fin, h.salon
       FROM clases c
       INNER JOIN cursos cu ON c.idCurso = cu.idCurso
       INNER JOIN materias m ON cu.idMateria = m.idMateria
       INNER JOIN horarios h ON cu.idCurso = h.idCurso
       WHERE cu.idProfesor = ? AND c.fecha >= CURRENT_DATE
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
    // Usamos REPLACE INTO para compatibilidad entre MySQL y SQLite en este caso simple
    await conn.execute(`
      REPLACE INTO usuario_profesor (idUsuario, especialidad, titulo)
      VALUES (?, ?, ?)
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

// 📚 Obtener Cursos Asignados al Profesor
export const getCursosProfesor = async (req: Request, res: Response) => {
    const conn = await connectDB();
    try {
        const profesorId = req.user?.id; // 🆔 ID del profesor autenticado

        if (!profesorId) {
            return res.status(401).json({ error: "Usuario no autenticado" });
        }

        const [cursos]: any = await conn.execute(`
            SELECT c.idCurso, m.nombre as materia, c.grado, c.seccion, c.anio
            FROM cursos c
            JOIN materias m ON c.idMateria = m.idMateria
            WHERE c.idProfesor = ?
        `, [profesorId]);

        res.json(cursos);
    } catch (error) {
        console.error("Error al obtener cursos del profesor:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    } finally {
        conn.release();
    }
};

// 👥 Obtener Estudiantes de un Curso (Para el dropdown)
export const getEstudiantesPorCurso = async (req: Request, res: Response) => {
    const conn = await connectDB();
    try {
        const { idCurso } = req.params;
        const profesorId = req.user?.id;

        // Verificar permisos: el profesor debe enseñar ese curso
        const [permiso]: any = await conn.execute(`
            SELECT idCurso FROM cursos WHERE idCurso = ? AND idProfesor = ?
        `, [idCurso, profesorId]);

        if (permiso.length === 0) {
            return res.status(403).json({ error: "No tienes permiso para ver estudiantes de este curso" });
        }

        // Obtener estudiantes
        const [estudiantes]: any = await conn.execute(`
            SELECT u.idUsuarios, u.nombres, u.apellidos
            FROM usuarios u
            JOIN curso_estudiante ce ON u.idUsuarios = ce.idEstudiante
            WHERE ce.idCurso = ? AND ce.estado = 'activo'
        `, [idCurso]);

        res.json(estudiantes);
    } catch (error) {
        console.error("Error al obtener estudiantes:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    } finally {
        conn.release();
    }
};

// 📊 Obtener Estadísticas de un Curso (Para Estadísticas)
export const getEstadisticasCurso = async (req: Request, res: Response) => {
    const conn = await connectDB();
    try {
        const { idCurso } = req.params;
        const profesorId = req.user?.id;

        // Verificar permisos
        const [permiso]: any = await conn.execute(`
            SELECT idCurso FROM cursos WHERE idCurso = ? AND idProfesor = ?
        `, [idCurso, profesorId]);

        if (permiso.length === 0) {
            return res.status(403).json({ error: "No autorizado" });
        }

        // Promedio general del curso en la materia de este profesor
        const [promedios]: any = await conn.execute(`
            SELECT AVG(cal.valor) as promedioCurso
            FROM calificaciones cal
            JOIN cursos c ON cal.idCurso = c.idCurso
            WHERE c.idCurso = ? AND c.idProfesor = ?
        `, [idCurso, profesorId]);

        // Lista de estudiantes con sus promedios
        const [estudiantesStats]: any = await conn.execute(`
            SELECT u.nombres, u.apellidos, AVG(cal.valor) as promedio,
            CASE
                WHEN AVG(cal.valor) >= 3.0 THEN 'Aprobado'
                ELSE 'Reprobado'
            END as estado
            FROM usuarios u
            JOIN calificaciones cal ON u.idUsuarios = cal.idEstudiante
            JOIN cursos c ON cal.idCurso = c.idCurso
            WHERE c.idCurso = ? AND c.idProfesor = ?
            GROUP BY u.idUsuarios
        `, [idCurso, profesorId]);

        // Asistencia promedio (Simulada si no hay datos complejos)
        // Ojo: 'asistencia' suele ser por clase.
        // Asumiendo tabla 'asistencia' con 'idEstudiante', 'idClase', 'asistio' (1/0)
        // Y 'clases' vinculada al curso.

        // Primero necesitamos saber las clases de este curso/profesor
        // Pero la tabla 'asistencia' y 'clases' puede variar. Usaré un LEFT JOIN genérico

        const [asistencias]: any = await conn.execute(`
            SELECT u.nombres, u.apellidos,
            COUNT(a.idAsistencia) as totalClases,
            SUM(CASE WHEN a.estado = 'presente' THEN 1 ELSE 0 END) as asistencias
            FROM usuarios u
            JOIN curso_estudiante ce ON u.idUsuarios = ce.idEstudiante
            LEFT JOIN asistencia a ON u.idUsuarios = a.idEstudiante
            LEFT JOIN clases cl ON a.idClase = cl.idClase
            JOIN cursos cur ON cl.idCurso = cur.idCurso
            WHERE ce.idCurso = ? AND cl.idCurso = ? AND cur.idProfesor = ?
            GROUP BY u.idUsuarios
        `, [idCurso, idCurso, profesorId]);

        // Si la tabla asistencia no está bien poblada, esto devolverá nulls, manejar en frontend.

        res.json({
            promedioGeneral: promedios[0]?.promedioCurso || 0,
            estudiantes: estudiantesStats,
            asistencias: asistencias
        });

    } catch (error) {
        console.error("Error estadísticas curso:", error);
        res.status(500).json({ error: "Error interno" });
    } finally {
        conn.release();
    }
};

// 📄 Reporte del Curso (Lista detallada)
export const getReporteCurso = async (req: Request, res: Response) => {
    const conn = await connectDB();
    try {
        const { idCurso } = req.params;
        const profesorId = req.user?.id;

        const [permiso]: any = await conn.execute(`SELECT idCurso FROM cursos WHERE idCurso = ? AND idProfesor = ?`, [idCurso, profesorId]);
        if (!permiso[0]) return res.status(403).json({ error: "No autorizado" });

        // Obtener todas las calificaciones de todos los estudiantes en este curso (para la materia del profesor)
        const [notas]: any = await conn.execute(`
            SELECT u.nombres, u.apellidos, cal.nombre, cal.valor, cal.fecha_asignacion as fecha
            FROM calificaciones cal
            JOIN usuarios u ON cal.idEstudiante = u.idUsuarios
            JOIN cursos c ON cal.idCurso = c.idCurso
            WHERE c.idCurso = ? AND c.idProfesor = ?
            ORDER BY u.apellidos, u.nombres, cal.fecha_asignacion
        `, [idCurso, profesorId]);

        res.json(notas);
    } catch (error) {
        console.error("Error reporte curso:", error);
        res.status(500).json({ error: "Error interno" });
    } finally {
        conn.release();
    }
};

// 📄 Reporte Individual Estudiante
export const getReporteEstudiante = async (req: Request, res: Response) => {
    const conn = await connectDB();
    try {
        const { idEstudiante, idCurso } = req.params;
        const profesorId = req.user?.id;

        const [permiso]: any = await conn.execute(`SELECT idCurso FROM cursos WHERE idCurso = ? AND idProfesor = ?`, [idCurso, profesorId]);
        if (!permiso[0]) return res.status(403).json({ error: "No autorizado" });

        // Detalle de notas
        const [notas]: any = await conn.execute(`
            SELECT nombre, valor, fecha_asignacion as fecha, comentarios as observacion
            FROM calificaciones
            WHERE idEstudiante = ? AND idCurso = ?
            ORDER BY fecha_asignacion DESC
        `, [idEstudiante, idCurso]);

        // Detalle de asistencia
        const [asistencia]: any = await conn.execute(`
            SELECT cl.fecha, a.estado, a.observaciones
            FROM asistencia a
            JOIN clases cl ON a.idClase = cl.idClase
            JOIN cursos cur ON cl.idCurso = cur.idCurso
            WHERE a.idEstudiante = ? AND cl.idCurso = ? AND cur.idProfesor = ?
            ORDER BY cl.fecha DESC
        `, [idEstudiante, idCurso, profesorId]);

        res.json({
            notas,
            asistencia
        });
    } catch (error) {
        console.error("Error reporte estudiante:", error);
        res.status(500).json({ error: "Error interno" });
    } finally {
        conn.release();
    }
};
