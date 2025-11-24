const assert = require('node:assert/strict');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver');

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
const DEFAULT_TIMEOUT = parseInt(process.env.E2E_TIMEOUT ?? '20000', 10);
const LONG_TIMEOUT = parseInt(process.env.E2E_LONG_TIMEOUT ?? '40000', 10);
// Se quiser ver o navegador rodando, mude para 'false' aqui ou no .env
const HEADLESS = (process.env.E2E_HEADLESS ?? 'true').toLowerCase() !== 'false';

const CLIENT_EMAIL = process.env.E2E_CLIENT_EMAIL || "joao@gmail.com";
const CLIENT_PASSWORD = process.env.E2E_CLIENT_PASSWORD || "senha-do-joao";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || "maria@gmail.com";
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || "maria1405";

function buildDriver() {
  const options = new chrome.Options()
    .addArguments('--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage')
    .windowSize({ width: 1280, height: 720 });

  if (HEADLESS) {
    options.addArguments('--headless=new');
  }

  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

describe('PitStop frontend – fluxo principal', function () {
  this.timeout(60000); // Timeout geral do Mocha
  let driver;

  // --- FUNÇÕES AUXILIARES ---

  const openLanding = async () => {
    await driver.get(BASE_URL);
  };

  const openLoginFromLanding = async () => {
    const accessButton = await driver.wait(
      until.elementLocated(By.css('[data-testid="landing-access-button"]')),
      DEFAULT_TIMEOUT,
    );
    await accessButton.click();

    await driver.wait(
      until.elementLocated(By.css('[data-testid="login-heading"]')),
      DEFAULT_TIMEOUT,
    );
  };

  const fillLoginForm = async (email, password) => {
    const emailInput = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-email-input"]')),
      DEFAULT_TIMEOUT,
    );
    await emailInput.clear();
    await emailInput.sendKeys(email);

    const passwordInput = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-password-input"]')),
      DEFAULT_TIMEOUT,
    );
    await passwordInput.clear();
    await passwordInput.sendKeys(password);
  };

  // Correção STALE ELEMENT: Essa função clica de forma robusta.
  // Se o botão mudar durante o clique, ela busca o novo e clica.
  const submitLoginForm = async () => {
    const selector = By.css('[data-testid="login-submit-button"]');
    try {
      const submitButton = await driver.wait(until.elementLocated(selector), DEFAULT_TIMEOUT);
      await submitButton.click();
    } catch (error) {
      if (error.name === 'StaleElementReferenceError') {
        // Elemento morreu? Busca o novo e tenta de novo.
        const freshButton = await driver.findElement(selector);
        await freshButton.click();
      } else {
        throw error;
      }
    }
  };

  // Função para checar se a mensagem de erro apareceu
  const waitForLoginError = async () => {
    // Busca pelo ID correto que vimos no Login.tsx
    const feedbackBox = await driver.wait(
      until.elementLocated(By.css('[data-testid="login-feedback"]')),
      DEFAULT_TIMEOUT
    );

    // Espera ter algum texto dentro
    await driver.wait(async () => {
      try {
        const text = await feedbackBox.getText();
        return text && text.trim().length > 0;
      } catch (e) {
        return false; // Se der erro de stale aqui, tenta na próxima iteração do wait
      }
    }, DEFAULT_TIMEOUT);

    return feedbackBox;
  };


  afterEach(async () => {
    if (driver) {
      try {
        await driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
      } catch (_) {
        // Ignorado
      }
      await driver.quit();
      driver = undefined;
    }
  });

  // --- TESTES ---

  it('exibe a landing page com o herói principal', async () => {
    driver = buildDriver();
    await openLanding();

    const heroHeading = await driver.wait(
      until.elementLocated(By.css('[data-testid="landing-hero-title"]')),
      DEFAULT_TIMEOUT,
    );

    const text = await heroHeading.getText();
    assert.ok(
      text.includes('Cuidamos do seu carro'),
      'Esperava encontrar o titulo do heroi na landing page',
    );
  });

  it('permite acessar o formulário de login pela landing page', async () => {
    driver = buildDriver();
    await openLanding();
    await openLoginFromLanding();

    const heading = await driver.findElement(By.css('[data-testid="login-heading"]'));
    assert.equal(await heading.getText(), 'Entre na sua conta');
  });

  it('mostra mensagem de erro quando o login falha', async () => {
    driver = buildDriver();
    await openLanding();
    await openLoginFromLanding();
    
    await fillLoginForm('usuario@invalido.test', 'senha-errada');
    await submitLoginForm(); // Clica sem esperar "disabled"

    // Verifica se a mensagem de erro aparece
    const feedback = await waitForLoginError();
    const messageText = (await feedback.getText()).toLowerCase();

    assert.ok(
      messageText.includes('erro') || 
      messageText.includes('não foi possível') || 
      messageText.includes('credenciais') ||
      messageText.includes('servidor'),
      `Esperava mensagem de erro. Recebido: "${messageText}"`
    );
  });

  it('carrega o portal do cliente após login válido', async function () {
    if (!CLIENT_EMAIL || !CLIENT_PASSWORD) {
      this.skip();
      return;
    }

    driver = buildDriver();
    await openLanding();
    await openLoginFromLanding();
    
    await fillLoginForm(CLIENT_EMAIL, CLIENT_PASSWORD);
    await submitLoginForm();

    // Em vez de monitorar o botão, esperamos DIRETO pelo elemento de sucesso.
    // O driver.wait vai tentar encontrar isso por até 40s (LONG_TIMEOUT)
    const clientHeading = await driver.wait(
      until.elementLocated(By.css('[data-testid="client-dashboard-title"]')),
      LONG_TIMEOUT,
    );

    assert.equal(await clientHeading.getText(), 'Portal do Cliente');
  });

  it('exibe o menu administrativo após login de administrador', async function () {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      this.skip();
      return;
    }

    driver = buildDriver();
    await openLanding();
    await openLoginFromLanding();
    
    await fillLoginForm(ADMIN_EMAIL, ADMIN_PASSWORD);
    await submitLoginForm();

    // Espera direto pelo menu de sucesso
    const clientesButton = await driver.wait(
      until.elementLocated(By.css('[data-testid="admin-nav-clientes"]')),
      LONG_TIMEOUT,
    );

    assert.ok(await clientesButton.isDisplayed(), 'O menu de Clientes deveria estar visível');
  });
  
});