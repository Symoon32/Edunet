import { Request, Response } from 'express';
import { connectDB } from '../db/connection';
import { hashPassword } from '../utils/password';
import { logAction } from '../utils/logger';

export async function getUsers(req: Request, res: Response) {
  try {
    const conn = await connectDB();
    try {
      // Build the query based on query parameters
      let sql = 'SELECT * FROM usuarios WHERE 1=1';
      const params: (string | number)[] = [];

      if (req.query.rol) {
        sql += ' AND idRol = ?';
        params.push(req.query.rol as string);
      }

      // Default to only active users unless explicitly requested
      if (req.query.is_active !== 'all') {
        sql += ' AND is_active = ?';
        params.push(req.query.is_active === 'false' ? 0 : 1);
      }

      const [rows] = await conn.execute(sql, params);
      res.json(rows);
    } finally {
      try { conn.release(); } catch (e) { /* ignore */ }
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: err });
  }
}

export async function createUser(req: Request, res: Response) {
  const loggedInUser = req.user;
  if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
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
      const [result]: any = await conn.execute(sql, [
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

      const idUsuarioCreado = result.insertId;

      // Log the action
      await logAction(loggedInUser.id, 'CREATE_USER', { createdUserId: idUsuarioCreado, createdUserEmail: correo });

      // Si es un acudiente (rol 3) y se proporcionó el documento del estudiante, crear relación
      if (Number(rol) === 3 && estudiante_relacionado) {
        // Buscar al estudiante por su documento (asumiendo que estudiante_relacionado contiene el documento o nombre)
        // Si es nombre, es ambiguo. Intentaremos asumir que el frontend enviará el documento en un campo adicional 'documento_estudiante'
        // o que 'estudiante_relacionado' es el documento.
        // Dado el esquema actual, usaremos 'documento_estudiante' del body si existe.

        const documentoEstudiante = req.body.documento_estudiante;
        if (documentoEstudiante) {
          const [estudiantes]: any = await conn.execute('SELECT idUsuarios FROM usuarios WHERE documento = ? AND idRol = 1', [documentoEstudiante]);
          if (estudiantes.length > 0) {
            const idEstudiante = estudiantes[0].idUsuarios;
            await conn.execute('INSERT INTO padre_estudiante (idPadre, idEstudiante) VALUES (?, ?)', [idUsuarioCreado, idEstudiante]);
          } else {
            console.warn(`No se encontró estudiante con documento ${documentoEstudiante} para asociar al padre.`);
          }
        }
      }

      res.status(201).json({ message: 'Usuario registrado correctamente', idUsuario: idUsuarioCreado });
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
  const loggedInUser = req.user;
  if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });
  let fields = { ...req.body };

  try {
      const conn = await connectDB();
      try {
          // Get the user being updated
          const [users]: any = await conn.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
          if (users.length === 0) {
              return res.status(404).json({ error: 'Usuario a actualizar no encontrado' });
          }
          const userToUpdate = users[0];

          // Authorization logic
          const isUpdatingSelf = loggedInUser.correo === userToUpdate.correo;
          const isRector = loggedInUser.is_rector;
          const isAdmin = loggedInUser.rol === 4;
          const isTargetAdmin = userToUpdate.idRol === 4;

          // A non-admin cannot update other users
          if (!isAdmin && !isUpdatingSelf) {
              return res.status(403).json({ error: 'No tienes permiso para actualizar este usuario' });
          }

          // An admin cannot update another admin unless they are a rector
          if (isAdmin && !isRector && isTargetAdmin && !isUpdatingSelf) {
              return res.status(403).json({ error: 'Un administrador no puede modificar a otro administrador' });
          }

          // Only a rector can change the is_rector flag, and they cannot remove it from themselves
          if (fields.is_rector !== undefined && !isRector) {
              return res.status(403).json({ error: 'Solo un rector puede asignar este permiso' });
          }
          if (isUpdatingSelf && isRector && fields.is_rector === false) {
            return res.status(403).json({ error: 'Un rector no puede quitarse su propio permiso' });
          }


          const allowedFields = [
              'nombres', 'apellidos', 'documento', 'telefono', 'direccion', 'fotoPerfil', 'password', 'grado',
              'contacto_emergencia', 'telefono_contacto_emergencia', 'curso_asignado',
              'nombre_estudiante_acargo', 'parentezco', 'cargo_admin', 'idRol', 'is_rector', 'is_active'
          ];

          if (fields.password) {
              fields.password = await hashPassword(fields.password);
          }

          fields = Object.fromEntries(Object.entries(fields).filter(([key]) => allowedFields.includes(key)));

          if (Object.keys(fields).length === 0) {
              return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
          }

          const setStr = Object.keys(fields).map(key => `${key} = ?`).join(', ');
          const values = Object.values(fields);
          const sql = `UPDATE usuarios SET ${setStr} WHERE correo = ?`;
          await conn.execute(sql, [...values, correo]);

          // Log the action
          await logAction(loggedInUser.id, 'UPDATE_USER', { updatedUserEmail: correo, updatedFields: Object.keys(fields) });

          res.json({ message: 'Usuario actualizado' });
      } finally {
          try { conn.release(); } catch (e) { /* ignore */ }
      }
  } catch (err) {
      res.status(500).json({ error: 'Error al actualizar usuario', details: err });
  }
}

export async function deleteUser(req: Request, res: Response) { // Now this is soft delete (inactivation)
  const { correo } = req.params;
  const loggedInUser = req.user;
  if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });

  try {
    const conn = await connectDB();
    try {
        const [users]: any = await conn.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario a inactivar no encontrado' });
        }
        const userToInactivate = users[0];

        // Rector cannot be inactivated
        if (userToInactivate.is_rector) {
            return res.status(403).json({ error: 'El rector no puede ser inactivado' });
        }

        // You cannot inactivate yourself
        if (loggedInUser.correo === userToInactivate.correo) {
            return res.status(403).json({ error: 'No puedes inactivarte a ti mismo' });
        }

        await conn.execute('UPDATE usuarios SET is_active = false WHERE correo = ?', [correo]);

        // Log the action
        await logAction(loggedInUser.id, 'INACTIVATE_USER', { inactivatedUserEmail: correo });

        res.json({ message: 'Usuario inactivado correctamente' });
    } finally {
      try { conn.release(); } catch (e) { /* ignore */ }
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al inactivar usuario', details: err });
  }
}

export async function getMisEstudiantes(req: Request, res: Response) {
  const loggedInUser = req.user;
  if (!loggedInUser) return res.status(401).json({ error: 'Usuario no autenticado' });

  if (loggedInUser.rol !== 3) {
      return res.status(403).json({ error: 'Solo los acudientes pueden consultar sus estudiantes asignados' });
  }

  try {
    const conn = await connectDB();
    try {
      const sql = `
        SELECT u.*
        FROM usuarios u
        JOIN padre_estudiante pe ON u.idUsuarios = pe.idEstudiante
        WHERE pe.idPadre = ?
      `;
      const [rows] = await conn.execute(sql, [loggedInUser.id]);
      res.json(rows);
    } finally {
      try { conn.release(); } catch (e) { /* ignore */ }
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estudiantes asignados', details: err });
  }
}
