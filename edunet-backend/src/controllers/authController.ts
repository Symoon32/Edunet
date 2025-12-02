import { Request, Response } from 'express';
import { connectDB } from '../db/connection';
import { comparePasswords } from '../utils/password';
import { generateToken } from '../utils/jwt'; 
import { sendResetEmail } from '../utils/email';
import { hashPassword } from '../utils/password';
import jwt from 'jsonwebtoken';

interface RegisterUserRequest {
  nombres: string;
  apellidos: string;
  correo: string;
  password: string;
  documento: number;
  telefono: string;
  direccion: string;
  rol: 'estudiante' | 'profesor' | 'acudiente' | 'administrador';
}

interface LoginResponse {
  token: string;
  rol: number;
}

import { RowDataPacket } from 'mysql2';

interface Usuarios extends RowDataPacket {
  idUsuarios: number;
  correo: string;
  password: string;
  idRol: number;
}

export async function login(req: Request, res: Response) {
  const usuarios = req.body.correo;
  const password = req.body.password;

  // Validar campos requeridos
  if (!usuarios || !password) {
    return res.status(400).json({
      error: 'Datos incompletos',
      details: 'El correo y la contraseña son requeridos'
    });
  }

  // Validar formato de correo
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(usuarios)) {
    return res.status(400).json({
      error: 'Formato inválido',
      details: 'El formato del correo electrónico no es válido'
    });
  }

  const conn = await connectDB();
  
  try {
    console.log('[authController] login attempt for:', usuarios);

    // Consulta preparada con campos específicos por seguridad
    const [rows]: [Usuarios[], any] = await conn.execute(
      'SELECT idUsuarios, correo, password, idRol FROM usuarios WHERE correo = ?', 
      [usuarios]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('[authController] user not found:', usuarios);
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        details: 'Usuario no encontrado'
      });
    }

    const user = rows[0];
    console.log('[authController] user found, id:', user.idUsuarios);

    const valid = await comparePasswords(password, user.password);
    console.log('[authController] password validation:', valid ? 'success' : 'failed');

    if (!valid) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        details: 'Contraseña incorrecta'
      });
    }

    const token = generateToken({
      id: user.idUsuarios,
      correo: user.correo,
      rol: user.idRol
    });

    console.log('[authController] login successful for user:', user.idUsuarios);
    
    const response: LoginResponse = {
      token,
      rol: user.idRol
    };

    res.json(response);

  } catch (err) {
    console.error('[authController] login error:', err);
    res.status(500).json({ 
      error: 'Error en login', 
      details: err instanceof Error ? err.message : 'Error desconocido'
    });
  } finally {
    try { 
      await conn.release();
      console.log('[authController] connection released');
    } catch (e) {
      console.error('[authController] error releasing connection:', e);
    }
  }
}


export async function forgotPassword(req: Request, res: Response) {
  const { correo } = req.body;
  try {
    const conn = await connectDB();
    try {
      const [rows] = await conn.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
      if (Array.isArray(rows) && rows.length > 0) {
        const user: any = rows[0];
      // Generar token de recuperación válido por 1 hora
      const token = generateToken({ 
        correo: user.correo, 
        id: user.idUsuarios,
        rol: user.idRol 
      });
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await sendResetEmail(correo, resetUrl);
      res.json({ message: 'Correo de recuperación enviado' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
    } finally {
      try { conn.release(); } catch (e) { /* ignore release errors */ }
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al enviar correo de recuperación', details: err });
  }
}

// POST /reset-password
export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  try {
    // Verificar token
    const secret: jwt.Secret = process.env.JWT_SECRET ?? 'default_secret';
    const payload: any = jwt.verify(token, secret);
    const correo = payload.correo;
    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(password);
    const conn = await connectDB();
    try {
      await conn.execute('UPDATE usuarios SET password = ? WHERE correo = ?', [hashedPassword, correo]);
      res.json({ message: 'Contraseña actualizada correctamente' });
    } finally {
      try { conn.release(); } catch (e) { /* ignore release errors */ }
    }
  } catch (err) {
    res.status(400).json({ error: 'Token inválido o expirado', details: err });
  }
}

// Registrar nuevo usuario
export async function register(req: Request, res: Response) {
  const conn = await connectDB();
  try {
    const userData: RegisterUserRequest = req.body;

    // Validar datos requeridos
    const requiredFields = ['nombres', 'apellidos', 'correo', 'password', 'documento', 'telefono', 'direccion', 'rol'];
    const missingFields = requiredFields.filter(field => !userData[field as keyof RegisterUserRequest]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Datos incompletos',
        missingFields
      });
    }

    // Validar formato de correo
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(userData.correo)) {
      return res.status(400).json({
        error: 'Formato inválido',
        details: 'El formato del correo electrónico no es válido'
      });
    }

    // Verificar si el correo ya existe
    const [existingUser]: any = await conn.execute(
      'SELECT correo FROM usuarios WHERE correo = ?',
      [userData.correo]
    );

    if (existingUser[0]) {
      return res.status(409).json({
        error: 'Correo ya registrado',
        details: 'Ya existe un usuario con este correo electrónico'
      });
    }

    // Obtener el ID del rol
    const [roles]: any = await conn.execute(
      'SELECT idRol FROM roles WHERE nombreRol = ?',
      [userData.rol]
    );

    if (!roles[0]) {
      return res.status(400).json({
        error: 'Rol inválido',
        details: 'El rol especificado no existe'
      });
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(userData.password);

    // Insertar usuario
    const [result]: any = await conn.execute(
      `INSERT INTO usuarios (
        nombres, apellidos, correo, documento, telefono, 
        direccion, password, idRol
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.nombres,
        userData.apellidos,
        userData.correo,
        userData.documento,
        userData.telefono,
        userData.direccion,
        hashedPassword,
        roles[0].idRol
      ]
    );

    // Generar token
    const token = generateToken({
      id: result.insertId,
      correo: userData.correo,
      rol: roles[0].idRol
    });

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      usuario: {
        id: result.insertId,
        nombres: userData.nombres,
        apellidos: userData.apellidos,
        correo: userData.correo,
        rol: userData.rol
      }
    });

  } catch (error: any) {
    console.error('Error en register:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  } finally {
    conn.release();
  }
}

