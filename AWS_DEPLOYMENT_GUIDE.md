# Guía de Despliegue en AWS - Proyecto Edunet

Esta guía detalla los pasos necesarios para desplegar el proyecto Edunet en una arquitectura de AWS utilizando **Windows Server (EC2)** para el Backend y **S3 + CloudFront** para el Frontend.

---

## 1. Requisitos Previos en AWS
- Una cuenta de AWS activa.
- Dominio registrado (preferiblemente en Route 53).
- Certificado SSL emitido en AWS Certificate Manager (ACM) para el dominio y subdominios.

---

## 2. Infraestructura del Backend (EC2 Windows Server)

### Configuración de la Instancia
1. Lanzar una instancia EC2 con **Windows Server 2022**.
2. Configurar el **Security Group**:
   - Puerto 80 (HTTP) y 443 (HTTPS).
   - Puerto 3389 (RDP) solo para tu IP.
   - Puerto 3306 (MySQL) si no usas RDS y necesitas acceso externo.

### Configuración del Servidor (IIS)
1. Instalar **IIS** (Internet Information Services) desde el Administrador del Servidor.
2. Instalar **Node.js** (versión LTS).
3. Instalar **IISNode**: Módulo que permite a IIS hospedar aplicaciones Node.js.
4. Instalar **URL Rewrite Module** para IIS.

### Despliegue del Código
1. Clonar el repositorio en `C:\inetpub\wwwroot\edunet-backend`.
2. Ejecutar `npm install`.
3. Ejecutar `npm run build` para generar la carpeta `dist`.
4. Crear un archivo `web.config` en la raíz del backend (`C:\inetpub\wwwroot\edunet-backend\web.config`) con el siguiente contenido:

```xml
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/app.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="nodejs">
          <match url="(.*)" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="dist/app.js" />
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <add segment="node_modules" />
          <add segment="iisnode" />
        </hiddenSegments>
      </requestFiltering>
    </security>
  </system.webServer>
</configuration>
```

5. Configurar el sitio en IIS apuntando a la carpeta del proyecto.

---

## 3. Base de Datos (MySQL)

### Configuración
1. Instalar **MySQL Server** en el Windows Server o usar **AWS RDS (MySQL)**.
2. Utilizar **MySQL Workbench** para conectarse y ejecutar el script `BdEdunet.sql`.
3. Crear un usuario con permisos adecuados para la aplicación.

---

## 4. Almacenamiento (AWS S3)

### Configuración del Bucket de Archivos (Uploads)
1. Crear un bucket de S3 exclusivo para las subidas del usuario (ej: `edunet-uploads`).
2. Configurar el **CORS** del bucket para permitir peticiones desde tu dominio.
3. Crear un usuario **IAM** con permisos `AmazonS3FullAccess` sobre ese bucket y obtener las credenciales (`Access Key` y `Secret Key`).

---

## 5. Infraestructura del Frontend (S3 + CloudFront)

### Preparación del Código
1. En `edunet-frontend/src/environments/environment.prod.ts`, actualizar la `apiUrl` con la URL de tu API en el EC2.
2. Ejecutar `npm run build` en la carpeta del frontend.

### Despliegue
1. Crear un bucket de S3 configurado para **Static Website Hosting**.
2. Subir el contenido de la carpeta `dist/edunet/browser` al bucket.
3. Crear una distribución de **CloudFront**:
   - Origin: El bucket de S3.
   - Configurar el certificado SSL de ACM.
   - Configurar **Error Pages**: Redirigir errores 403 y 404 a `/index.html` con estado 200 (necesario para Angular Routing).

---

## 6. Variables de Entorno (Archivo .env en Backend)

Configura las siguientes variables en el servidor EC2:

```env
PORT=3000
USE_SQLITE=false

# MySQL Config
DB_HOST=localhost (o endpoint de RDS)
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=edunet

# JWT Config
JWT_SECRET=una_clave_secreta_muy_segura

# AWS S3 Config (Para Uploads)
USE_S3=true
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=TU_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=TU_SECRET_KEY
AWS_S3_BUCKET=edunet-uploads
```

---

## 7. Lista de Chequeo Final
- [ ] ¿El Backend responde en el puerto configurado a través de IIS?
- [ ] ¿El Frontend en S3 carga correctamente y puede comunicarse con la API?
- [ ] ¿Las subidas de archivos (perfil y materiales) se guardan en el bucket de S3?
- [ ] ¿El certificado SSL está correctamente aplicado tanto en CloudFront como en el Balanceador/IIS?
- [ ] ¿Se han migrado todos los datos iniciales de la base de datos?
