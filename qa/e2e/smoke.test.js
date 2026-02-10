const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

// Cargar .env manualmente si existe
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
}

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:4200';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@edunet.com';
const ADMIN_PASS = process.env.TEST_ADMIN_PASS || '123456';
const PROF_EMAIL = process.env.TEST_PROF_EMAIL || 'profesor@edunet.com';
const PROF_PASS = process.env.TEST_PROF_PASS || '123456';
const EST_EMAIL = process.env.TEST_EST_EMAIL || 'estudiante@edunet.com';
const EST_PASS = process.env.TEST_EST_PASS || '123456';

async function runSmokeTest() {
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  const screenshotsDir = path.join(__dirname, '../reports/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const results = [];

  async function takeScreenshot(name) {
    const image = await driver.takeScreenshot();
    const fileName = `${Date.now()}_${name}.png`;
    const filePath = path.join(screenshotsDir, fileName);
    fs.writeFileSync(filePath, image, 'base64');
    return fileName;
  }

  async function login(email, password) {
    await driver.get(BASE_URL);
    await driver.wait(until.elementLocated(By.css('input[type="password"]')), 10000);
    const emailInput = await driver.findElement(By.css('input[type="email"], input[placeholder*="Usuario"], input[name="correo"]'));
    await emailInput.clear();
    await emailInput.sendKeys(email);
    const passInput = await driver.findElement(By.css('input[type="password"]'));
    await passInput.clear();
    await passInput.sendKeys(password);
    const loginBtn = await driver.findElement(By.css('button[type="submit"], button.btn-primary'));
    await driver.executeScript("arguments[0].click();", loginBtn);
  }

  async function logout() {
    await driver.sleep(2000);
    try {
        await driver.executeScript(`
            const btn = document.querySelector('.logout-btn') ||
                        [...document.querySelectorAll('button, a')].find(el => el.innerText.includes('Cerrar') || el.title.includes('Cerrar'));
            if(btn) btn.click();
        `);
        // No esperamos obligatoriamente a que cambie la URL en el logout para evitar bloqueos
        await driver.sleep(2000);
    } catch (e) {
        console.warn('Logout warning:', e.message);
    }
  }

  try {
    console.log('--- Iniciando Smoke Test ---');

    // Admin
    try {
        console.log('Probando Admin...');
        await login(ADMIN_EMAIL, ADMIN_PASS);
        await driver.wait(until.urlContains('/admin'), 15000);
        results.push({ step: 'Login Admin', status: 'PASS', screenshot: await takeScreenshot('admin_ok') });
        await logout();
    } catch(e) {
        results.push({ step: 'Login Admin', status: 'FAIL', error: e.message, screenshot: await takeScreenshot('admin_fail') });
    }

    // Profesor
    try {
        console.log('Probando Profesor...');
        await login(PROF_EMAIL, PROF_PASS);
        await driver.wait(until.urlContains('/profesor'), 15000);
        results.push({ step: 'Login Profesor', status: 'PASS', screenshot: await takeScreenshot('profesor_ok') });
        await logout();
    } catch(e) {
        results.push({ step: 'Login Profesor', status: 'FAIL', error: e.message, screenshot: await takeScreenshot('profesor_fail') });
    }

    // Estudiante
    try {
        console.log('Probando Estudiante...');
        await login(EST_EMAIL, EST_PASS);
        // El estudiante puede tardar más en cargar
        await driver.wait(until.urlMatches(/\/estudiantes|\/estudiante/), 20000);
        results.push({ step: 'Login Estudiante', status: 'PASS', screenshot: await takeScreenshot('estudiante_ok') });
        await logout();
    } catch(e) {
        results.push({ step: 'Login Estudiante', status: 'FAIL', error: e.message, screenshot: await takeScreenshot('estudiante_fail') });
    }

    console.log('--- Smoke Test Finalizado ---');

  } catch (error) {
    console.error('Error imprevisto:', error.message);
  } finally {
    await driver.quit();
    fs.writeFileSync(path.join(__dirname, '../reports/results.json'), JSON.stringify(results, null, 2));
  }
}

runSmokeTest();
