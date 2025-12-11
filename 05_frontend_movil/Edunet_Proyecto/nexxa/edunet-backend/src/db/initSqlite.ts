
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

  // Password hash for '123456'
  const passwordHash = '$2b$10$Fc0/FQYhj8EIObof0rGYl.sVxneaB6mWHXG0eJyhZEQ4ga6XPhb.K';

  // 1. Administrator (Rector)
  const admin = await db.get('SELECT * FROM usuarios WHERE correo = ?', ['admin@edunet.com']);
  if (!admin) {
    console.log('Insertando usuario Administrador (admin@edunet.com)...');
    await db.run(`
      INSERT INTO usuarios (nombres, apellidos, correo, documento, telefono, direccion, password, idRol, is_rector, is_active)
      VALUES ('Administrador', 'Principal', 'admin@edunet.com', 90001, '3000000001', 'Oficina Principal', ?, 4, 1, 1)
    `, [passwordHash]);
  }

  // 2. Professor
  const prof = await db.get('SELECT * FROM usuarios WHERE correo = ?', ['profesor@edunet.com']);
  if (!prof) {
      console.log('Insertando usuario Profesor (profesor@edunet.com)...');
      await db.run(`
        INSERT INTO usuarios (
          nombres, apellidos, correo, documento, telefono, direccion,
          password, idRol, is_active
        ) VALUES (
          'Profesor', 'Ejemplo', 'profesor@edunet.com', 90002, '3000000002', 'Sala Profesores',
          ?, 2, 1
        )
      `, [passwordHash]);
  }

  // 3. Student
  const student = await db.get('SELECT * FROM usuarios WHERE correo = ?', ['estudiante@edunet.com']);
  if (!student) {
      console.log('Insertando usuario Estudiante (estudiante@edunet.com)...');
      await db.run(`
        INSERT INTO usuarios (
          nombres, apellidos, correo, documento, telefono, direccion,
          password, idRol, is_active
        ) VALUES (
          'Estudiante', 'Ejemplo', 'estudiante@edunet.com', 90003, '3000000003', 'Aula 101',
          ?, 1, 1
        )
      `, [passwordHash]);
  }

  // 4. Parent (Acudiente)
  const parent = await db.get('SELECT * FROM usuarios WHERE correo = ?', ['padre@edunet.com']);
  if (!parent) {
      console.log('Insertando usuario Padre (padre@edunet.com)...');
      await db.run(`
        INSERT INTO usuarios (
          nombres, apellidos, correo, documento, telefono, direccion,
          password, idRol, is_active
        ) VALUES (
          'Padre', 'Ejemplo', 'padre@edunet.com', 90004, '3000000004', 'Casa',
          ?, 3, 1
        )
      `, [passwordHash]);
  }

  // Keep existing rector for backward compatibility if it exists
  const rector = await db.get('SELECT * FROM usuarios WHERE correo = ?', ['rector@edunet.com']);
  if (!rector) {
     console.log('Insertando usuario Rector Legacy...');
     await db.run(`
      INSERT INTO usuarios (nombres, apellidos, correo, documento, telefono, direccion, password, idRol, is_rector, is_active)
      VALUES ('Admin', 'Legacy', 'rector@edunet.com', 99999, '00000', 'Dirección', '$2b$10$Etzep9VXgpzGbgEo.d7ua.9ASrTPx5RZF4ySqNuAxRHQ5xnKlr8Py', 4, 1, 1)
    `);
  }

  console.log('Base de datos SQLite inicializada correctamente en: ' + DB_PATH);
  await db.close();
}

initSqlite().catch(err => {
  console.error('Error al inicializar SQLite:', err);
  process.exit(1);
});
