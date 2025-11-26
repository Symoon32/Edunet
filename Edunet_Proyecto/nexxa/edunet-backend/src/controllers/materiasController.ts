import { Request, Response } from 'express';
import { connectDB } from '../db/connection';
import { logAction } from '../utils/logger';

export async function createMateria(req: Request, res: Response) {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
    const { nombre, descripcion, codigo } = req.body;
    try {
        const conn = await connectDB();
        try {
            const sql = 'INSERT INTO materias (nombre, descripcion, codigo) VALUES (?, ?, ?)';
            const [result]: any = await conn.execute(sql, [nombre, descripcion, codigo]);
            await logAction(loggedInUser.id, 'CREATE_MATERIA', { materiaId: result.insertId, nombre, codigo });
            res.status(201).json({ message: 'Materia creada', idMateria: result.insertId });
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al crear materia', details: err });
    }
}

export async function getMaterias(req: Request, res: Response) {
    try {
        const conn = await connectDB();
        try {
            const [rows] = await conn.execute('SELECT * FROM materias');
            res.json(rows);
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener materias', details: err });
    }
}

export async function updateMateria(req: Request, res: Response) {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
    const { idMateria } = req.params;
    const { nombre, descripcion, codigo } = req.body;
    try {
        const conn = await connectDB();
        try {
            const sql = 'UPDATE materias SET nombre = ?, descripcion = ?, codigo = ? WHERE idMateria = ?';
            await conn.execute(sql, [nombre, descripcion, codigo, idMateria]);
            await logAction(loggedInUser.id, 'UPDATE_MATERIA', { materiaId: idMateria, nombre, codigo });
            res.json({ message: 'Materia actualizada' });
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar materia', details: err });
    }
}

export async function deleteMateria(req: Request, res: Response) {
    const loggedInUser = req.user;
    if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
    const { idMateria } = req.params;
    try {
        const conn = await connectDB();
        try {
            await conn.execute('DELETE FROM materias WHERE idMateria = ?', [idMateria]);
            await logAction(loggedInUser.id, 'DELETE_MATERIA', { materiaId: idMateria });
            res.json({ message: 'Materia eliminada' });
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar materia', details: err });
    }
}
