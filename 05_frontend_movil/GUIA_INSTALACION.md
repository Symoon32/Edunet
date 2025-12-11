# Guía de Instalación y Ejecución - Edunet

Sigue estos pasos exactos para ejecutar el proyecto en tu PC desde cero.

## 1. Instalar Node.js
Si no tienes Node.js instalado:
1. Ve a [nodejs.org](https://nodejs.org/).
2. Descarga e instala la versión **LTS** (Recomendada).
3. Una vez instalado, abre Visual Studio Code y verifica la instalación abriendo una terminal (`Ctrl` + `ñ`) y escribiendo:
   ```bash
   node -v
   ```
   Deberías ver una versión como `v18.x.x` o `v20.x.x`.

## 2. Configurar el Backend (Servidor)
1. En Visual Studio Code, abre una terminal nueva.
2. Navega a la carpeta del backend:
   ```bash
   cd Edunet_Proyecto/nexxa/edunet-backend
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. **IMPORTANTE**: Crea un archivo llamado `.env` en la carpeta `edunet-backend` y pega el siguiente contenido exacto:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_NAME=edunet
   JWT_SECRET=edunet
   JWT_EXPIRES_IN=1h
   PORT=3000
   USE_SQLITE=true
   ```
5. Inicia el servidor:
   ```bash
   npm run dev
   ```
   Verás mensajes indicando que la base de datos SQLite se inicializó y el servidor corre en el puerto 3000.

## 3. Configurar el Frontend (Interfaz)
1. Sin cerrar la terminal anterior, abre una **segunda terminal** (haz clic en el botón `+` o icono de dividir en el panel de terminal).
2. Navega a la carpeta del frontend:
   ```bash
   cd Edunet_Proyecto/nexxa/edunet
   ```
3. Instala las dependencias (esto puede tardar unos minutos):
   ```bash
   npm install
   ```
4. Inicia la aplicación:
   ```bash
   npm start
   ```
5. Espera a que termine de compilar. Verás un mensaje como: `Application bundle generation complete.` y `Active on http://localhost:4200/`.

## 4. Probar la Aplicación
1. Abre tu navegador (Chrome, Edge, etc.).
2. Ve a la dirección: [http://localhost:4200](http://localhost:4200)
3. Inicia sesión con las credenciales de administrador por defecto:
   - **Correo**: `admin@edunet.com`
   - **Contraseña**: `123456`

¡Listo! Ya tienes el proyecto corriendo localmente.
