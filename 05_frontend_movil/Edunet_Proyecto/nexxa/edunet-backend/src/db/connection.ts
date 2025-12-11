
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

dotenv.config();

// Define a common interface for the connection pool
interface DBConnection {
  execute(sql: string, params?: any[]): Promise<[any[], any]>;
  query(sql: string, params?: any[]): Promise<[any[], any]>;
  getConnection(): Promise<any>;
  end(): Promise<void>;
}

// Wrapper class for SQLite to match MySQL2 interface
class SQLiteWrapper implements DBConnection {
  private dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>>;

  constructor(dbPath: string) {
    this.dbPromise = open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }

  async execute(sql: string, params: any[] = []): Promise<[any[], any]> {
    const db = await this.dbPromise;

    // Convert MySQL '?' placeholders to SQLite '?' (no change needed usually)
    // But check if query is INSERT/UPDATE/DELETE vs SELECT
    const isSelect = sql.trim().toLowerCase().startsWith('select');

    try {
      if (isSelect) {
        const rows = await db.all(sql, params);
        // Return matching structure [rows, fields]
        return [rows, []];
      } else {
        const result = await db.run(sql, params);
        // Emulate MySQL OkPacket
        const okPacket = {
          affectedRows: result.changes,
          insertId: result.lastID,
          warningStatus: 0,
        };
        return [okPacket as any, []];
      }
    } catch (err) {
        console.error('SQLite Error on query:', sql, params, err);
        throw err;
    }
  }

  // Alias query to execute for compatibility
  async query(sql: string, params: any[] = []): Promise<[any[], any]> {
    return this.execute(sql, params);
  }

  async getConnection() {
    // Return self as the connection, since SQLite is file-based and "pool" concept is different
    // We add a 'release' method to satisfy pool consumers
    return {
      execute: this.execute.bind(this),
      query: this.query.bind(this),
      release: () => {}, // No-op
      beginTransaction: async () => { /* Not implemented in this simple wrapper */ },
      commit: async () => { /* Not implemented */ },
      rollback: async () => { /* Not implemented */ }
    };
  }

  async end() {
      const db = await this.dbPromise;
      await db.close();
  }
}

let pool: any; // Using any to bypass strict type check conflicts between mysql2 and custom wrapper

// Check environment to decide which DB to use
const USE_SQLITE = process.env.USE_SQLITE === 'true';

if (USE_SQLITE) {
  console.log('🔌 Usando base de datos SQLite (Modo Compatibilidad)');
  // Back to original path
  const dbPath = path.resolve(__dirname, '../../database.sqlite');
  pool = new SQLiteWrapper(dbPath);
} else {
  // Configuración por defecto para MySQL
  // Se ha solicitado "quitar la contraseña" para este entorno, pero mantenemos la lógica estándar:
  // Si no hay password en .env, mysql2 usará string vacío o lo que se provea.
  // Para el caso de MySQL real, se respetan las variables de entorno.
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD, // Si es undefined, mysql intenta conectar sin password
    database: process.env.DB_NAME || 'edunet',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

export const connection = pool;

export async function connectDB() {
  if (USE_SQLITE) {
      return (pool as SQLiteWrapper).getConnection();
  }
  return await (pool as mysql.Pool).getConnection();
}
