const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generateReports() {
  const resultsPath = path.join(__dirname, 'results.json');
  if (!fs.existsSync(resultsPath)) {
    console.error('No se encontró results.json. Ejecuta las pruebas primero.');
    return;
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  const date = new Date().toLocaleString();

  // Generar HTML
  let rows = '';
  results.forEach(res => {
    const screenshotHtml = res.screenshot
      ? `<br><img src="../screenshots/${res.screenshot}" width="400" style="border: 1px solid #ddd; margin-top: 10px;">`
      : '';
    rows += `
      <tr>
        <td>${res.step}</td>
        <td class="${res.status.toLowerCase()}">${res.status}</td>
        <td>${res.error || 'N/A'} ${screenshotHtml}</td>
      </tr>
    `;
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Calidad Edunet</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #2c3e50; }
        .summary { margin-bottom: 20px; font-size: 1.1em; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #bdc3c7; padding: 12px; text-align: left; }
        th { background-color: #ecf0f1; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2c3e50; padding-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reporte de Calidad - Edunet</h1>
        <span>Fecha: ${date}</span>
      </div>
      <div class="summary">
        <p><strong>Herramientas:</strong> Selenium (E2E), Jest (Backend), Jasmine (Frontend)</p>
        <p><strong>Estado General:</strong> ${results.every(r => r.status === 'PASS') ? 'EXITOSO' : 'CON FALLOS'}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Paso / Prueba</th>
            <th>Estado</th>
            <th>Detalles / Evidencia</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const htmlPath = path.join(__dirname, 'html/index.html');
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`Reporte HTML generado en: ${htmlPath}`);

  // Generar PDF usando Puppeteer
  console.log('Generando PDF...');
  try {
      const browser = await puppeteer.launch({
          headless: 'new',
          args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      // Para el PDF necesitamos rutas absolutas para las imágenes o incrustarlas
      // Pero para simplificar, cargaremos el archivo HTML recién creado
      await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

      const pdfPath = path.join(__dirname, 'pdf/reporte_calidad.pdf');
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });

      await browser.close();
      console.log(`Reporte PDF generado en: ${pdfPath}`);
  } catch (err) {
      console.error('Error generando PDF:', err);
  }
}

generateReports();
