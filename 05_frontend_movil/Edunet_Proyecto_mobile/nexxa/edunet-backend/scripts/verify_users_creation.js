
const http = require('http');

/**
 * Automated Test Script for User Creation
 *
 * Usage: node scripts/verify_users_creation.js
 *
 * This script verifies that an Administrator can successfully create:
 * 1. A Student
 * 2. A Professor
 * 3. An Administrator
 *
 * It requires the backend server to be running on localhost:3000.
 */

function postRequest(path, data, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data),
            }
        };

        if (token) {
            options.headers['Authorization'] = 'Bearer ' + token;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: body });
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function run() {
    console.log('--- Starting Automated User Creation Verification ---');
    console.log('1. Logging in as Admin...');

    // Login
    let loginData = JSON.stringify({ correo: 'admin@edunet.com', password: 'admin' });
    let res = await postRequest('/auth/login', loginData);

    // Retry with alternate password if default fails
    if (res.status !== 200) {
        console.log(`Login with "admin" failed (${res.status}). Retrying with "123456"...`);
        loginData = JSON.stringify({ correo: 'admin@edunet.com', password: '123456' });
        res = await postRequest('/auth/login', loginData);
    }

    if (res.status !== 200) {
        console.error('CRITICAL: Failed to login:', res.body);
        process.exit(1);
    }

    const token = JSON.parse(res.body).token;
    console.log('SUCCESS: Logged in. Token obtained.');
    console.log('-----------------------------------');

    // Helper to create user
    const createUser = async (roleName, roleId, extraFields = {}) => {
        console.log(`Creating ${roleName} (Rol ${roleId})...`);
        const user = {
            nombres: `AutoTest${roleName}`,
            apellidos: 'User',
            correo: `autotest${roleName.toLowerCase()}_${Date.now()}@edunet.com`,
            documento: `DOC${roleName.toUpperCase()}${Date.now()}`,
            telefono: '1234567890',
            direccion: `${roleName} Street 123`,
            password: 'password123',
            rol: roleId,
            ...extraFields
        };

        const createRes = await postRequest('/users', JSON.stringify(user), token);
        if (createRes.status === 201) {
             console.log(`SUCCESS: ${roleName} created. ID: ${JSON.parse(createRes.body).idUsuario}`);
        } else {
             console.error(`FAILURE: Could not create ${roleName}. Status: ${createRes.status}`);
             console.error('Response:', createRes.body);
             process.exit(1);
        }
    };

    try {
        // 2. Create Student (Rol 1)
        await createUser('Student', 1, { grado: '11A', contacto_emergencia: 'Mom', telefono_contacto_emergencia: '999' });

        // 3. Create Professor (Rol 2)
        await createUser('Professor', 2, { curso_asignado: 'Physics' });

        // 4. Create Admin (Rol 4)
        await createUser('Admin', 4, { cargo: 'Coordinator' });

        console.log('-----------------------------------');
        console.log('All tests passed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Unexpected Error:', error);
        process.exit(1);
    }
}

run().catch(console.error);
