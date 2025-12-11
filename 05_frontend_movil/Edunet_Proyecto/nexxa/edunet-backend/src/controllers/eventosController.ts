/**
 * Eventos Controller
 * Implementación de gestión de eventos y avisos.
 */
import { Request, Response } from 'express';
import { connectDB } from '../db/connection';

const roleMap: { [key: number]: string } = {
    1: 'estudiantes',
    2: 'profesores',
    3: 'padres',
    4: 'administrador'
};


export async function createEvento(req: Request, res: Response) {
    try {
        // Map frontend fields (if necessary) to backend expectations.
        // Frontend 'anuncios.component.ts' sends 'fecha_inicio' which matches backend.
        // However, we ensure that if fields are missing they are handled or defaults provided if logical.
        const { titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios } = req.body;

        // Validation for SQLite 'NOT NULL' constraint on fecha_inicio
        if (!fecha_inicio) {
             return res.status(400).json({ message: 'La fecha de inicio es obligatoria' });
        }

        const connection = await connectDB();
        try {
            const [result]: any = await connection.execute(
                `INSERT INTO eventos (titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios]
            );
            res.status(201).json({ message: 'Evento creado correctamente', idEvento: result.insertId });
        } finally {
            try { connection.release(); } catch (e) { /* ignore */ }
        }
    } catch (error) {
        console.error('Error en createEvento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}


export async function getEventos(req: Request, res: Response) {
    try {
        const loggedInUser = req.user;
        if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
        const connection = await connectDB();
        try {
            let query = 'SELECT * FROM eventos';
            const params = [];

            // Admins see all events. Other roles see 'todos' and events for their role.
            if (loggedInUser.rol !== 4) {
                const userRoleString = roleMap[loggedInUser.rol];
                query += ' WHERE destinatarios = ? OR destinatarios = ?';
                params.push('todos', userRoleString);
            }

            query += ' ORDER BY fecha_inicio DESC';

            const [rows]: any = await connection.execute(query, params);
            res.json(rows);
        } finally {
            try { connection.release(); } catch (e) { /* ignore */ }
        }
    } catch (error) {
        console.error('Error en getEventos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}


export async function updateEvento(req: Request, res: Response) {
    const { idEvento } = req.params;
    const { titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios } = req.body;
    try {
        const connection = await connectDB();
        try {
            const sql = `
                UPDATE eventos
                SET titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?,
                    ubicacion = ?, tipo = ?, destinatarios = ?
                WHERE idEvento = ?
            `;
            await connection.execute(sql, [titulo, descripcion, fecha_inicio, fecha_fin, ubicacion, tipo, destinatarios, idEvento]);
            res.json({ message: 'Evento actualizado correctamente' });
        } finally {
            try { connection.release(); } catch (e) { /* ignore */ }
        }
    } catch (error) {
        console.error('Error en updateEvento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}


export async function deleteEvento(req: Request, res: Response) {
    try {
        const { idEvento } = req.params;
        const connection = await connectDB();
        try {
            await connection.execute('DELETE FROM eventos WHERE idEvento = ?', [idEvento]);
            res.json({ message: 'Evento eliminado correctamente' });
        } finally {
            try { connection.release(); } catch (e) { /* ignore */ }
        }
    } catch (error) {
        console.error('Error en deleteEvento:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}
