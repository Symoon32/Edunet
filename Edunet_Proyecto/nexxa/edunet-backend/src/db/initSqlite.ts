
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

// Use a memory database or local file. Since permissions are tricky, let's try just 'database.sqlite' in root of backend
// but ensure we don't commit it.
const DB_PATH = path.resolve(__dirname, '../../database.sqlite');
const SCHEMA_PATH = path.resolve(__dirname, '../../BdEdunet_sqlite.sql');

async function initSqlite() {
  console.log('Inicializando base de datos SQLite...');

  // Try to remove it first to start fresh if permissions were messed up
  try {
    if (fs.existsSync(DB_PATH)) {
      // fs.unlinkSync(DB_PATH); // Don't delete, persistence is desired
    }
  } catch(e) {}

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

  // Split statements by semicolon, but be careful with triggers or complex statements (simple split is okay for this schema)
  const statements = schema.split(';').filter(stmt => stmt.trim() !== '');

  for (const stmt of statements) {
    if (stmt.trim()) {
      await db.run(stmt);
    }
  }

  // Insert Roles if not exist
  const roles = await db.all('SELECT * FROM roles');
  if (roles.length === 0) {
    console.log('Insertando roles por defecto...');
    await db.run(`INSERT INTO roles (nombreRol) VALUES ("estudiante")`);
    await db.run(`INSERT INTO roles (nombreRol) VALUES ("profesor")`);
    await db.run(`INSERT INTO roles (nombreRol) VALUES ("acudiente")`);
    await db.run(`INSERT INTO roles (nombreRol) VALUES ("administrador")`);
  }

  // Insert Materias if not exist
  const materias = await db.all('SELECT * FROM materias');
  if (materias.length === 0) {
      console.log('Insertando materias por defecto...');
      await db.run(`INSERT INTO materias (nombre, descripcion, codigo) VALUES
        ('Matemáticas', 'Curso básico de matemáticas', 'MAT101'),
        ('Lenguaje', 'Curso de lenguaje y comunicación', 'LEN101'),
        ('Ciencias Naturales', 'Curso de ciencias naturales', 'CNA101'),
        ('Historia', 'Curso de historia y geografía', 'HIS101')`);
  }

  // Insert Rector if not exist
  const rector = await db.get('SELECT * FROM usuarios WHERE correo = ?', ['rector@edunet.com']);
  if (!rector) {
    console.log('Insertando usuario Rector...');
    // Note: Password hash logic would ideally use the same bcrypt hash, but for now we insert the provided hash.
    await db.run(`
      INSERT INTO usuarios (nombres, apellidos, correo, documento, telefono, direccion, password, idRol, is_rector, is_active)
      VALUES ('Admin', 'Principal', 'rector@edunet.com', 99999, '00000', 'Dirección', '$2b$10$Etzep9VXgpzGbgEo.d7ua.9ASrTPx5RZF4ySqNuAxRHQ5xnKlr8Py', 4, 1, 1)
    `);
  }

  // Insert Profesor sample if not exist
  const prof = await db.get('SELECT * FROM usuarios WHERE correo = ?', ['juan.perez@edunet.test']);
  if (!prof) {
      console.log('Insertando usuario Profesor de prueba...');
      await db.run(`
        INSERT INTO usuarios (
          nombres, apellidos, correo, documento, telefono, direccion, fotoPerfil,
          password, grado, contacto_emergencia, telefono_contacto_emergencia,
          curso_asignado, nombre_estudiante_acargo, parentezco, cargo_admin, idRol
        ) VALUES (
          'Juan', 'Perez', 'juan.perez@edunet.test', 10000001, '3001234567', 'Calle 1', NULL,
          '$2b$10$xxm.jDZ6eX1CfIv.zS2VuOXriVYoGbcUw4IU70nZDDYpZ6cAZLJsu', NULL, NULL, NULL,
          NULL, NULL, NULL, NULL, 2
        )
      `);
  }

  console.log('Base de datos SQLite inicializada correctamente en: ' + DB_PATH);
  await db.close();
}

initSqlite().catch(err => {
  console.error('Error al inicializar SQLite:', err);
  process.exit(1);
});
