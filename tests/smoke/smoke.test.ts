/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   ASTANA VALVE — SMOKE TESTS                            ║
 * ║   Проверка: критические элементы загружаются и видны   ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Smoke тест — быстрая проверка: "сайт жив?"
 * Покрывает: загрузка, навигация, hero, секции, модал, контакты
 * Запускается через HTTP (localhost:4321), не file://
 */

import { test, expect, Page } from '@playwright/test';

// HTTP-сервер запущен: npm run serve → http://localhost:4321
const BASE_URL = 'http://localhost:4321';

// ─── Хелпер: открыть страницу и собрать JS-ошибки ──────────
async function openPage(page: Page, url: string) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  // Только pageerror — fetch/network errors на file:// не считаем
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return errors;
}

// ═══════════════════════════════════════════════════════════
test.describe('🔥 SMOKE: Страница загружается', () => {

  test('SM-01 | index.html открывается без JS-ошибок', async ({ page }) => {
    const errors = await openPage(page, BASE_URL);
    expect(errors, `JS-ошибки: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('SM-02 | Заголовок страницы содержит "Astana Valve"', async ({ page }) => {
    await openPage(page, BASE_URL);
    const title = await page.title();
    expect(title).toContain('Astana Valve');
  });

  test('SM-03 | Метатег description присутствует и не пустой', async ({ page }) => {
    await openPage(page, BASE_URL);
    const desc = await page.$eval(
      'meta[name="description"]',
      (el) => el.getAttribute('content') ?? ''
    );
    expect(desc.length).toBeGreaterThan(10);
  });

  test('SM-04 | Charset UTF-8 установлен (поддержка кириллицы)', async ({ page }) => {
    await openPage(page, BASE_URL);
    const charset = await page.$eval(
      'meta[charset]',
      (el) => el.getAttribute('charset') ?? ''
    );
    expect(charset.toUpperCase()).toBe('UTF-8');
  });

  test('SM-05 | Viewport meta присутствует (mobile-ready)', async ({ page }) => {
    await openPage(page, BASE_URL);
    const viewport = await page.$eval(
      'meta[name="viewport"]',
      (el) => el.getAttribute('content') ?? ''
    );
    expect(viewport).toContain('width=device-width');
  });

  test('SM-06 | Canonical ссылается на astanavalve.kz', async ({ page }) => {
    await openPage(page, BASE_URL);
    const canonical = await page.$eval(
      'link[rel="canonical"]',
      (el) => el.getAttribute('href') ?? ''
    );
    expect(canonical).toContain('astanavalve.kz');
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('🧭 SMOKE: Навигация', () => {

  test('SM-07 | Логотип "Astana Valve" виден в шапке', async ({ page }) => {
    await openPage(page, BASE_URL);
    const logo = page.locator('header .logo-title').first();
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('Astana Valve');
  });

  test('SM-08 | Пункты навигации присутствуют (минимум 4)', async ({ page }) => {
    await openPage(page, BASE_URL);
    const links = page.locator('.nav-links > li > a');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('SM-09 | Языковой переключатель RU/ҚЗ/EN присутствует в DOM', async ({ page }) => {
    await openPage(page, BASE_URL);
    // #langSw скрыт на мобильном, проверяем наличие в DOM
    const langSw = page.locator('#langSw');
    await expect(langSw).toBeAttached();
    const text = await langSw.textContent();
    expect(text).toContain('RU');
    expect(text).toContain('ҚЗ');
    expect(text).toContain('EN');
  });

  test('SM-10 | Телефон +7 707 855-55-11 присутствует в шапке или drawer', async ({ page }) => {
    await openPage(page, BASE_URL);
    // На десктопе — .header-phone, на мобиле — .drawer-phone
    const phoneLocator = page.locator('.header-phone, .drawer-phone').first();
    await expect(phoneLocator).toBeAttached();
    const text = await phoneLocator.textContent();
    expect(text).toContain('+7 707');
  });

  test('SM-11 | WhatsApp ссылка ведёт на wa.me/77078555511', async ({ page }) => {
    await openPage(page, BASE_URL);
    // Берём первую .btn-wa в документе (header или drawer)
    const waBtn = page.locator('.btn-wa').first();
    await expect(waBtn).toBeAttached();
    const href = await waBtn.getAttribute('href');
    expect(href).toContain('wa.me/77078555511');
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('🦸 SMOKE: Hero-секция', () => {

  test('SM-12 | Hero-секция существует и видна', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.hero')).toBeVisible();
  });

  test('SM-13 | H1 заголовок виден и содержит текст', async ({ page }) => {
    await openPage(page, BASE_URL);
    const h1 = page.locator('.hero-h1');
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text?.trim().length).toBeGreaterThan(5);
  });

  test('SM-14 | Hero badge присутствует и видна', async ({ page }) => {
    await openPage(page, BASE_URL);
    const badge = page.locator('.hero-badge');
    await expect(badge).toBeVisible();
    const text = await badge.textContent();
    expect(text?.trim().length).toBeGreaterThan(3);
  });

  test('SM-15 | Кнопка CTA в hero присутствует', async ({ page }) => {
    await openPage(page, BASE_URL);
    const btn = page.locator('.hero-cta .btn-primary').first();
    await expect(btn).toBeVisible();
  });

  test('SM-16 | Кнопка "Скачать каталог PDF" присутствует', async ({ page }) => {
    await openPage(page, BASE_URL);
    const btn = page.locator('.hero-cta .btn-outline').first();
    await expect(btn).toBeVisible();
  });

  test('SM-17 | Промо-бар с акциями виден', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.promo-bar')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('📦 SMOKE: Критические секции', () => {

  test('SM-18 | Секция каталога продукции существует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.catalog')).toBeVisible();
  });

  test('SM-19 | Секция подбора арматуры существует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.selector-section')).toBeVisible();
  });

  test('SM-20 | Секция "Почему выбирают Astana Valve" существует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.why')).toBeVisible();
  });

  test('SM-21 | Секция "Объекты по Казахстану" существует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.projects')).toBeVisible();
  });

  test('SM-22 | Секция отзывов клиентов существует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.testimonials')).toBeVisible();
  });

  test('SM-23 | PDF-баннер существует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.pdf-banner')).toBeVisible();
  });

  test('SM-24 | Блог / Справочник инженера существует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.blog')).toBeVisible();
  });

  test('SM-25 | Секция доставки существует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.delivery')).toBeVisible();
  });

  test('SM-26 | Контактная секция существует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.contact')).toBeVisible();
  });

  test('SM-27 | Футер присутствует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await expect(page.locator('.footer')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('📬 SMOKE: Контакты', () => {

  test('SM-28 | Телефон +7 707 855-55-11 есть в контактах', async ({ page }) => {
    await openPage(page, BASE_URL);
    const phone = page.locator('.contact-val').first();
    await expect(phone).toContainText('+7 707 855-55-11');
  });

  test('SM-29 | Email astanavalve@mail.ru виден', async ({ page }) => {
    await openPage(page, BASE_URL);
    const email = page.locator('.contact-val').nth(1);
    await expect(email).toContainText('astanavalve@mail.ru');
  });

  test('SM-30 | Адрес г. Астана виден в контактах', async ({ page }) => {
    await openPage(page, BASE_URL);
    const addr = page.locator('.contact-val[data-key="c_addr"]');
    await expect(addr).toContainText('Астана');
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('🪟 SMOKE: Модальное окно', () => {

  test('SM-31 | Модальное окно изначально скрыто', async ({ page }) => {
    await openPage(page, BASE_URL);
    const modal = page.locator('#modal-questionnaire');
    await expect(modal).not.toBeVisible();
  });

  test('SM-32 | Кнопка CTA открывает модал', async ({ page }) => {
    await openPage(page, BASE_URL);
    await page.locator('.hero-cta .btn-primary').first().click();
    const modal = page.locator('#modal-questionnaire');
    await expect(modal).toBeVisible();
  });

  test('SM-33 | Поле имени в модале присутствует', async ({ page }) => {
    await openPage(page, BASE_URL);
    await page.locator('.hero-cta .btn-primary').first().click();
    const nameInput = page.locator('.modal-inp[type="text"]').first();
    await expect(nameInput).toBeVisible();
    const ph = await nameInput.getAttribute('placeholder');
    expect(ph).toBeTruthy();
  });

  test('SM-34 | Кнопка закрытия модала работает', async ({ page }) => {
    await openPage(page, BASE_URL);
    await page.locator('.hero-cta .btn-primary').first().click();
    await expect(page.locator('#modal-questionnaire')).toBeVisible();
    // force:true — обходим stopPropagation на родительском .modal
    await page.locator('.modal-close').click({ force: true });
    await expect(page.locator('#modal-questionnaire')).not.toBeVisible();
  });

  test('SM-35 | PDF каталог модал открывается', async ({ page }) => {
    await openPage(page, BASE_URL);
    // Ищем кнопку открытия PDF модала
    const pdfBtn = page.locator('.btn-pdf').first();
    await pdfBtn.click();
    await expect(page.locator('#pdfCatalogModal')).toBeVisible();
  });

  test('SM-36 | PDF каталог модал закрывается', async ({ page }) => {
    await openPage(page, BASE_URL);
    await page.locator('.btn-pdf').first().click();
    await expect(page.locator('#pdfCatalogModal')).toBeVisible();
    await page.locator('#closePdfCatalog').click({ force: true });
    await expect(page.locator('#pdfCatalogModal')).not.toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('🌐 SMOKE: Мультиязычность', () => {

  test('SM-37 | RU язык активен по умолчанию', async ({ page }) => {
    await openPage(page, BASE_URL);
    const activeLang = page.locator('#langSw span.active');
    await expect(activeLang).toHaveText('RU');
  });

  test('SM-38 | Переключение на казахский (ҚЗ) работает', async ({ page }) => {
    await openPage(page, BASE_URL);
    await page.evaluate(() => (window as any).setLang('kz'));
    await expect(page.locator('#langSw span.active')).toHaveText('ҚЗ');
  });

  test('SM-39 | Переключение на английский (EN) работает', async ({ page }) => {
    await openPage(page, BASE_URL);
    await page.evaluate(() => (window as any).setLang('en'));
    await expect(page.locator('#langSw span.active')).toHaveText('EN');
  });

  test('SM-40 | html lang меняется при смене языка', async ({ page }) => {
    await openPage(page, BASE_URL);
    await page.evaluate(() => (window as any).setLang('en'));
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('📱 SMOKE: Мобильная версия', () => {

  test('SM-41 | На мобильном (390px) hero-секция видна', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, BASE_URL);
    await expect(page.locator('.hero')).toBeVisible();
  });

  test('SM-42 | На мобильном логотип виден', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, BASE_URL);
    await expect(page.locator('header .logo-title').first()).toBeVisible();
  });

  test('SM-43 | На мобильном бургер-кнопка видна', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, BASE_URL);
    await expect(page.locator('#burgerBtn')).toBeVisible();
  });

  test('SM-44 | Бургер открывает мобильное меню', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, BASE_URL);
    await page.locator('#burgerBtn').click();
    await expect(page.locator('#mobileDrawer')).toBeVisible();
  });

  test('SM-45 | На планшете (768px) страница загружается', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openPage(page, BASE_URL);
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('⚡ SMOKE: Производительность', () => {

  test('SM-46 | Страница загружается менее чем за 5 секунд', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'load' });
    expect(Date.now() - start).toBeLessThan(5000);
  });

  test('SM-47 | DOM готов менее чем за 2 секунды', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(Date.now() - start).toBeLessThan(2000);
  });

  test('SM-48 | CSS файл отдаётся сервером (200)', async ({ page }) => {
    const resp = await page.request.get(`${BASE_URL}/style.min.css`);
    expect(resp.status()).toBe(200);
  });

});
