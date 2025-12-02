import { connectDB } from '../db/connection';

export async function logAction(idUsuario: number, accion: string, detalles: object) {
    try {
        const conn = await connectDB();
        try {
            const sql = 'INSERT INTO system_log (idUsuario, accion, detalles) VALUES (?, ?, ?)';
            await conn.execute(sql, [idUsuario, accion, JSON.stringify(detalles)]);
        } finally {
            try { conn.release(); } catch (e) { /* ignore */ }
        }
    } catch (err) {
        console.error('Failed to log action:', err);
    }
}
