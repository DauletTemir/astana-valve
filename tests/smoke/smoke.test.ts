/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   ASTANA VALVE — SMOKE TESTS                            ║
 * ║   Проверка: критические элементы загружаются и видны   ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Smoke тест — быстрая проверка: "сайт жив?"
 * Покрывает: загрузка, навигация, hero, секции, модал, контакты
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

const INDEX_URL = `file://${path.resolve(__dirname, '../../index.html')}`;

// ─── Хелпер: открыть страницу и собрать JS-ошибки ──────────
async function openPage(page: Page, url: string) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`Console error: ${msg.text()}`);
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  return errors;
}

// ═══════════════════════════════════════════════════════════
test.describe('🔥 SMOKE: Страница загружается', () => {

  test('SM-01 | index.html открывается без JS-ошибок', async ({ page }) => {
    const errors = await openPage(page, INDEX_URL);
    expect(errors, `JS-ошибки: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('SM-02 | Заголовок страницы содержит "Astana Valve"', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const title = await page.title();
    expect(title).toContain('Astana Valve');
  });

  test('SM-03 | Метатег description присутствует и не пустой', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const desc = await page.$eval(
      'meta[name="description"]',
      (el) => el.getAttribute('content') ?? ''
    );
    expect(desc.length).toBeGreaterThan(10);
  });

  test('SM-04 | Charset UTF-8 установлен (поддержка кириллицы)', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const charset = await page.$eval(
      'meta[charset]',
      (el) => el.getAttribute('charset') ?? ''
    );
    expect(charset.toUpperCase()).toBe('UTF-8');
  });

  test('SM-05 | Viewport meta присутствует (mobile-ready)', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const viewport = await page.$eval(
      'meta[name="viewport"]',
      (el) => el.getAttribute('content') ?? ''
    );
    expect(viewport).toContain('width=device-width');
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('🧭 SMOKE: Навигация', () => {

  test('SM-06 | Логотип "Astana Valve" виден в шапке', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const logo = page.locator('.logo-title');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('Astana Valve');
  });

  test('SM-07 | Пункты навигации присутствуют (минимум 4)', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const links = page.locator('.nav-links > li > a');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('SM-08 | Языковой переключатель RU/ҚЗ/EN виден', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const langSw = page.locator('#langSw');
    await expect(langSw).toBeVisible();
    const text = await langSw.textContent();
    expect(text).toContain('RU');
    expect(text).toContain('ҚЗ');
    expect(text).toContain('EN');
  });

  test('SM-09 | Телефон +7 707 855-55-11 виден в шапке', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const phone = page.locator('.header-phone').first();
    await expect(phone).toBeVisible();
    await expect(phone).toContainText('+7 707');
  });

  test('SM-10 | Кнопка WhatsApp в шапке ведёт на wa.me', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const waBtn = page.locator('header .btn-wa').first();
    await expect(waBtn).toBeVisible();
    const href = await waBtn.getAttribute('href');
    expect(href).toContain('wa.me/77078555511');
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('🦸 SMOKE: Hero-секция', () => {

  test('SM-11 | Hero-секция существует и видна', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.hero')).toBeVisible();
  });

  test('SM-12 | H1 заголовок виден и содержит текст', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const h1 = page.locator('.hero-h1');
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text?.trim().length).toBeGreaterThan(5);
  });

  test('SM-13 | Hero badge содержит "АСТАНА" (на казахском — язык по умолчанию)', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const badge = page.locator('.hero-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('АСТАНА');
  });

  test('SM-14 | Кнопка "Подобрать арматуру" присутствует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const btn = page.locator('.hero-cta .btn-primary').first();
    await expect(btn).toBeVisible();
  });

  test('SM-15 | Кнопка "Скачать каталог PDF" присутствует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const btn = page.locator('.hero-cta .btn-outline').first();
    await expect(btn).toBeVisible();
  });

  test('SM-16 | Промо-бар с акциями виден', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.promo-bar')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('📦 SMOKE: Критические секции', () => {

  test('SM-17 | Секция каталога продукции существует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.catalog')).toBeVisible();
  });

  test('SM-18 | Секция подбора арматуры существует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.selector-section')).toBeVisible();
  });

  test('SM-19 | Секция "Почему выбирают Astana Valve" существует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.why')).toBeVisible();
  });

  test('SM-20 | Секция "Объекты по Казахстану" существует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.projects')).toBeVisible();
  });

  test('SM-21 | Секция отзывов клиентов существует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.testimonials')).toBeVisible();
  });

  test('SM-22 | PDF-баннер существует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.pdf-banner')).toBeVisible();
  });

  test('SM-23 | Блог / Справочник инженера существует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.blog')).toBeVisible();
  });

  test('SM-24 | Секция доставки существует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.delivery')).toBeVisible();
  });

  test('SM-25 | Контактная форма существует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.contact')).toBeVisible();
  });

  test('SM-26 | Футер присутствует', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await expect(page.locator('.footer')).toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('📬 SMOKE: Контакты', () => {

  test('SM-27 | Телефон +7 707 855-55-11 есть в контактах', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const phone = page.locator('.contact-val').first();
    await expect(phone).toContainText('+7 707 855-55-11');
  });

  test('SM-28 | Email astanavalve@mail.ru виден', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const email = page.locator('.contact-val').nth(1);
    await expect(email).toContainText('astanavalve@mail.ru');
  });

  test('SM-29 | Адрес г. Астана виден в контактах', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const addr = page.locator('.contact-val[data-key="c_addr"]');
    await expect(addr).toContainText('Астана');
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('🪟 SMOKE: Модальное окно', () => {

  test('SM-30 | Модальное окно изначально скрыто', async ({ page }) => {
    await openPage(page, INDEX_URL);
    const modal = page.locator('#modal-questionnaire');
    await expect(modal).not.toBeVisible();
  });

  test('SM-31 | Кнопка "Подобрать арматуру" открывает модал', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await page.locator('.hero-cta .btn-primary').first().click();
    const modal = page.locator('#modal-questionnaire');
    await expect(modal).toBeVisible();
  });

  test('SM-32 | Поле имени в модале присутствует (казахский placeholder)', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await page.locator('.hero-cta .btn-primary').first().click();
    // На казахском placeholder = "Аты-жөніңіз"
    const nameInput = page.locator('.modal-inp[type="text"]').first();
    await expect(nameInput).toBeVisible();
    const ph = await nameInput.getAttribute('placeholder');
    expect(ph).toBeTruthy();
  });

  test('SM-33 | Кнопка закрытия модала работает', async ({ page }) => {
    await openPage(page, INDEX_URL);
    await page.locator('.hero-cta .btn-primary').first().click();
    await expect(page.locator('#modal-questionnaire')).toBeVisible();
    await page.locator('.modal-close').click();
    await expect(page.locator('#modal-questionnaire')).not.toBeVisible();
  });

});

// ═══════════════════════════════════════════════════════════
test.describe('📱 SMOKE: Мобильная версия', () => {

  test('SM-34 | На мобильном (390px) hero-секция видна', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, INDEX_URL);
    await expect(page.locator('.hero')).toBeVisible();
  });

  test('SM-35 | На мобильном логотип виден', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openPage(page, INDEX_URL);
    await expect(page.locator('.logo-title')).toBeVisible();
  });

  test('SM-36 | На планшете (768px) страница загружается', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await openPage(page, INDEX_URL);
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
  });

});
