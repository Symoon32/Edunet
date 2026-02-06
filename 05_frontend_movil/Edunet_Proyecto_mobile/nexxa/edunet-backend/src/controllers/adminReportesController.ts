import { Request, Response } from 'express';
import { connectDB } from '../db/connection';

export async function getUsersByRole(req: Request, res: Response) {
    const { idRol } = req.params;
    try {
        const conn = await connectDB();
        try {
            const [rows] = await conn.execute('SELECT * FROM usuarios WHERE idRol = ?', [idRol]);
            res.json(rows);
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios por rol', details: err });
    }
}

export async function getTeacherAssignments(req: Request, res: Response) {
    const { idProfesor } = req.params;
    try {
        const conn = await connectDB();
        try {
            const sql = `
                SELECT c.idCurso, m.nombre as nombreMateria, c.grado, c.seccion
                FROM cursos c
                JOIN materias m ON c.idMateria = m.idMateria
                WHERE c.idProfesor = ?
            `;
            const [rows] = await conn.execute(sql, [idProfesor]);
            res.json(rows);
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener asignaciones de profesor', details: err });
    }
}

export async function getCourseEnrollments(req: Request, res: Response) {
    const { idCurso } = req.params;
    try {
        const conn = await connectDB();
        try {
            const sql = `
                SELECT u.idUsuarios, u.nombres, u.apellidos, u.correo
                FROM curso_estudiante ce
                JOIN usuarios u ON ce.idEstudiante = u.idUsuarios
                WHERE ce.idCurso = ?
            `;
            const [rows] = await conn.execute(sql, [idCurso]);
            res.json(rows);
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener estudiantes del curso', details: err });
    }
}

export async function getActivityLog(req: Request, res: Response) {
    try {
        const conn = await connectDB();
        try {
            const [rows] = await conn.execute('SELECT * FROM system_log ORDER BY fecha DESC LIMIT 100');
            res.json(rows);
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener el registro de actividad', details: err });
    }
}

export async function getGradesByCourse(req: Request, res: Response) {
    const { idCurso } = req.params;
    try {
        const conn = await connectDB();
        try {
            const sql = `
                SELECT u.nombres, u.apellidos, c.tipo, c.nombre, c.valor
                FROM calificaciones c
                JOIN usuarios u ON c.idEstudiante = u.idUsuarios
                WHERE c.idCurso = ?
                ORDER BY u.apellidos, u.nombres
            `;
            const [rows] = await conn.execute(sql, [idCurso]);
            res.json(rows);
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener calificaciones por curso', details: err });
    }
}

export async function getStudentAttendance(req: Request, res: Response) {
    const { idEstudiante } = req.params;
    try {
        const conn = await connectDB();
        try {
            const sql = `
                SELECT cl.fecha, cl.tema, a.estado
                FROM asistencia a
                JOIN clases cl ON a.idClase = cl.idClase
                WHERE a.idEstudiante = ?
                ORDER BY cl.fecha DESC
            `;
            const [rows] = await conn.execute(sql, [idEstudiante]);
            res.json(rows);
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener asistencia del estudiante', details: err });
    }
}

export async function getCourseAttendance(req: Request, res: Response) {
    const { idCurso } = req.params;
    try {
        const conn = await connectDB();
        try {
            const sql = `
                SELECT u.nombres, u.apellidos, cl.fecha, a.estado
                FROM asistencia a
                JOIN usuarios u ON a.idEstudiante = u.idUsuarios
                JOIN clases cl ON a.idClase = cl.idClase
                WHERE cl.idCurso = ?
                ORDER BY cl.fecha DESC, u.apellidos, u.nombres
            `;
            const [rows] = await conn.execute(sql, [idCurso]);
            res.json(rows);
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener asistencia del curso', details: err });
    }
}
