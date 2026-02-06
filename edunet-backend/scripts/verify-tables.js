const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'edunet',
      waitForConnections: true,
      connectionLimit: 2,
      queueLimit: 0
    });

    console.log('Connecting to database...');
    const conn = await pool.getConnection();
    
    console.log('\nVerificando usuario con ID 1:');
    const [usuario] = await conn.query('SELECT * FROM usuarios WHERE idUsuarios = 1');
    console.log('Usuario:', usuario[0]);

    console.log('\nVerificando rol del usuario:');
    const [rol] = await conn.query('SELECT * FROM roles WHERE idRol = ?', [usuario[0].idRol]);
    console.log('Rol:', rol[0]);

    console.log('\nVerificando datos de profesor:');
    const [profesor] = await conn.query('SELECT * FROM usuario_profesor WHERE idUsuario = 1');
    console.log('Profesor:', profesor[0]);

    console.log('\nVerificando estructura de usuario_profesor:');
    const [estructura] = await conn.query('SHOW CREATE TABLE usuario_profesor');
    console.log('Estructura:', estructura[0]['Create Table']);

    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();