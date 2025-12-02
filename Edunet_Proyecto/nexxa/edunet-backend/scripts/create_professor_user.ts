
import { connectDB } from '../src/db/connection';
import { hashPassword } from '../src/utils/password';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

async function createProfessorUser() {
  const conn = await connectDB();

  try {
    const userEmail = 'juan.perez@edunet.com';
    const rawPassword = 'Profesor123!';
    const userRoleName = 'profesor'; // Or use ID 2 directly
    const userRoleId = 2; // Assuming 2 is profesor from memory

    console.log(`Checking if user ${userEmail} exists...`);

    const [existingUsers]: any = await conn.execute(
      'SELECT * FROM usuarios WHERE correo = ?',
      [userEmail]
    );

    if (existingUsers.length > 0) {
      console.log(`User ${userEmail} already exists. Updating password...`);
      const hashedPassword = await hashPassword(rawPassword);
      await conn.execute(
        'UPDATE usuarios SET password = ? WHERE correo = ?',
        [hashedPassword, userEmail]
      );
      console.log('Password updated successfully.');
    } else {
      console.log(`User ${userEmail} does not exist. Creating...`);
      const hashedPassword = await hashPassword(rawPassword);

      // We need to check if Role 2 exists or what the roles are
      // Just in case, let's verify roles
      const [roles]: any = await conn.execute('SELECT * FROM roles WHERE idRol = ?', [userRoleId]);
      if (roles.length === 0) {
          console.log('Role ID 2 not found. Attempting to find by name...');
          const [rolesByName]: any = await conn.execute('SELECT * FROM roles WHERE nombreRol = ?', [userRoleName]);
          if(rolesByName.length > 0) {
             console.log(`Found role ${userRoleName} with ID ${rolesByName[0].idRol}`);
             // Use this ID if needed, but for now we stick to 2 if valid or use this one
          } else {
             console.error('Role not found. Please initialize DB correctly.');
             process.exit(1);
          }
      }

      await conn.execute(
        `INSERT INTO usuarios (
          nombres, apellidos, correo, documento, telefono,
          direccion, password, idRol, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          'Juan',
          'Perez',
          userEmail,
          '123456789',
          '555-1234',
          'Calle Falsa 123',
          hashedPassword,
          userRoleId
        ]
      );
      console.log(`User ${userEmail} created successfully.`);
    }

  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
}

createProfessorUser();
