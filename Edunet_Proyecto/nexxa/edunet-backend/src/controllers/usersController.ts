import { Request, Response } from 'express';
import { connectDB } from '../db/connection';
import { hashPassword } from '../utils/password';

export async function getUsers(req: Request, res: Response) {
  try {
    const conn = await connectDB();
    try {
      const [rows] = await conn.execute('SELECT * FROM usuarios');
      res.json(rows);
    } finally {
      try { conn.release(); } catch (e) { /* ignore */ }
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: err });
  }
}

export async function createUser(req: Request, res: Response) {
  const {
    nombres,
    apellidos,
    correo,
    documento,
    telefono,
    direccion,
    fotoPerfil,
    password,
    grado,
    contacto_emergencia,
    telefono_contacto_emergencia,
    curso_asignado,
    estudiante_relacionado,
    parentesco,
    cargo,
    rol
  } = req.body;

  try {
    const hashedPassword = await hashPassword(password);
    const conn = await connectDB();
    try {
      const sql = `INSERT INTO usuarios (nombres, apellidos, correo, documento, telefono, direccion, fotoPerfil, password, grado, contacto_emergencia, telefono_contacto_emergencia, curso_asignado, nombre_estudiante_acargo, parentezco, cargo_admin, idRol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      await conn.execute(sql, [
      nombres,
      apellidos,
      correo,
      documento,
      telefono,
      direccion,
      fotoPerfil || null,
      hashedPassword,
      grado,
      contacto_emergencia,
      telefono_contacto_emergencia,
      curso_asignado,
      estudiante_relacionado,
      parentesco,
      cargo,
      rol
    ]);
      res.status(201).json({ message: 'Usuario registrado correctamente' });
    } finally {
      try { conn.release(); } catch (e) { /* ignore */ }
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar usuario', details: err });
  }
}

export async function getUserByEmail(req: Request, res: Response) {
  const { correo } = req.params;
  try {
    const conn = await connectDB();
    try {
      const [rows] = await conn.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
      if (Array.isArray(rows) && rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    } finally {
      try { conn.release(); } catch (e) { /* ignore */ }
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar usuario', details: err });
  }
}

export async function updateUser(req: Request, res: Response) {
  const { correo } = req.params;
  let fields = { ...req.body };

  const allowedFields = [
    'nombres', 'apellidos', 'documento', 'telefono', 'direccion', 'fotoPerfil', 'password', 'grado',
    'contacto_emergencia', 'telefono_contacto_emergencia', 'curso_asignado',
    'nombre_estudiante_acargo', 'parentezco', 'cargo_admin', 'idRol'
  ];

  // Hash password if contrasena is present
  if (fields.password) {
    fields.password = await hashPassword(fields.password);
    delete fields.password;
  }

  // Map frontend fields to DB fields
  if (fields.estudiante_relacionado) {
    fields.nombre_estudiante_acargo = fields.estudiante_relacionado;
    delete fields.estudiante_relacionado;
  }
  if (fields.parentesco) {
    fields.parentezco = fields.parentesco;
    delete fields.parentesco;
  }
  if (fields.cargo) {
    fields.cargo_admin = fields.cargo;
    delete fields.cargo;
  }
  if (fields.rol) {
    fields.idRol = fields.rol;
    delete fields.rol;
  }

  fields = Object.fromEntries(Object.entries(fields).filter(([key]) => allowedFields.includes(key)));

  try {
    const conn = await connectDB();
    try {
      if (Object.keys(fields).length === 0) {
        return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
      }
      const setStr = Object.keys(fields).map(key => `${key} = ?`).join(', ');
      const values = Object.values(fields);
      const sql = `UPDATE usuarios SET ${setStr} WHERE correo = ?`;
      await conn.execute(sql, [...values, correo]);
      res.json({ message: 'Usuario actualizado' });
    } finally {
      try { conn.release(); } catch (e) { /* ignore */ }
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario', details: err });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { correo } = req.params;
  try {
    const conn = await connectDB();
    try {
      await conn.execute('DELETE FROM usuarios WHERE correo = ?', [correo]);
      res.json({ message: 'Usuario eliminado' });
    } finally {
      try { conn.release(); } catch (e) { /* ignore */ }
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario', details: err });
  }
}
