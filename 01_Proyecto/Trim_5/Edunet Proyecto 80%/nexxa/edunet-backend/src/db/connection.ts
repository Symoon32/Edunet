
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Pool de conexiones (recomendado para aplicaciones web)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'SENA',
  database: process.env.DB_NAME || 'edunet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exportamos el pool como `connection` para compatibilidad con los controladores
export const connection = pool;

// También mantenemos una función helper para obtener una conexión si se necesita
export async function connectDB() {
  return await pool.getConnection();
}

