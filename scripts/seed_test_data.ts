
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const DB_PATH = path.resolve(__dirname, '../edunet-backend/database.sqlite');

async function seedTestData() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  console.log('Seeding test data for professor...');

  // Ensure Materias exist
  await db.run(`INSERT OR IGNORE INTO materias (idMateria, nombre, descripcion, codigo) VALUES (1, 'Matemáticas', 'Curso básico', 'MAT101')`);

  // Ensure Professor exists (ID 2 usually)
  const prof = await db.get('SELECT idUsuarios FROM usuarios WHERE correo = ?', ['profesor@edunet.com']);
  if (!prof) {
      console.error('Professor not found');
      process.exit(1);
  }
  const idProfesor = prof.idUsuarios;

  // Insert a Course
  await db.run(`INSERT OR IGNORE INTO cursos (idCurso, idMateria, idProfesor, periodo, anio, grado, seccion)
                VALUES (1, 1, ?, 'Trimestre 1', 2024, '10', 'A')`, [idProfesor]);

  // Insert a Student into course
  const student = await db.get('SELECT idUsuarios FROM usuarios WHERE correo = ?', ['estudiante@edunet.com']);
  if (student) {
      await db.run(`INSERT OR IGNORE INTO curso_estudiante (idCurso, idEstudiante, fechaInscripcion, estado)
                    VALUES (1, ?, '2024-01-01', 'activo')`, [student.idUsuarios]);

      // Insert a grade
      await db.run(`INSERT OR IGNORE INTO calificaciones (idCurso, idEstudiante, tipo, nombre, valor, peso, fecha_asignacion)
                    VALUES (1, ?, 'tarea', 'Tarea 1', 4.5, 20, '2024-02-01')`, [student.idUsuarios]);
  }

  // Insert a Class
  await db.run(`INSERT OR IGNORE INTO clases (idClase, idCurso, fecha, hora_inicio, hora_fin, tema, descripcion)
                VALUES (1, 1, '2024-02-10', '08:00', '10:00', 'Algebra', 'Intro')`);

  // Insert Attendance
  if (student) {
      await db.run(`INSERT OR IGNORE INTO asistencia (idClase, idEstudiante, estado, observaciones)
                    VALUES (1, ?, 'presente', 'A tiempo')`, [student.idUsuarios]);
  }

  console.log('Test data seeded.');
  await db.close();
}

seedTestData().catch(console.error);
