/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   ASTANA VALVE — FUNCTIONAL TESTS                       ║
 * ║   Проверка: интерактивность и бизнес-логика работают   ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Функциональные тесты — проверяют каждую фичу в деталях:
 * мультиязычность, фильтры, подборщик, модальные окна и т.д.
 */

import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

const INDEX_URL = `file://${path.resolve(__dirname, '../../src/index.html')}`;

async function goto(page: Page) {
  await page.goto(INDEX_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');
}

// ═══════════════════════════════════════════════════════════
test.describe('🌐 FUNCTIONAL: Мультиязычность (i18n)', () => {

  test('FN-01 | RU активен по умолчанию', async ({ page }) => {
    await goto(page);
    const activeLang = page.locator('#langBox span.active');
    await expect(activeLang).toHaveText('RU');
  });

  test('FN-02 | Переключение на казахский (ҚЗ)', async ({ page }) => {
    await goto(page);
    await page.click('#langBox span:has-text("ҚЗ")');
    const activeLang = page.locator('#langBox span.active');
    await expect(activeLang).toHaveText('ҚЗ');
  });

  test('FN-03 | Текст hero меняется на казахский', async ({ page }) => {
    await goto(page);
    await page.click('#langBox span:has-text("ҚЗ")');
    const h1 = page.locator('.hero-h1');
    const text = await h1.textContent();
    expect(text).toContain('АРМАТУРА');
  });

  test('FN-04 | Переключение на английский (EN)', async ({ page }) => {
    await goto(page);
    await page.click('#langBox span:has-text("EN")');
    const activeLang = page.locator('#langBox span.active');
    await expect(activeLang).toHaveText('EN');
  });

  test('FN-05 | Текст hero меняется на английский', async ({ page }) => {
    await goto(page);
    await page.click('#langBox span:has-text("EN")');
    const h1 = page.locator('.hero-h1');
    const text = await h1.textContent();
    expect(text?.toLowerCase()).toContain('valve');
  });

  test('FN-06 | Навигация на казахском содержит правильные ссылки', async ({ page }) => {
    await goto(page);
    await page.click('#langBox span:has-text("ҚЗ")');
    const navTexts = await page.locator('.nav-links > li > a span[data-k]').allTextContents();
    expect(navTexts.join(' ')).toContain('Каталог');
  });

  test('FN-07 | Переключение RU → KZ → EN → RU не ломает страницу', async ({ page }) => {
    await goto(page);
    for (const lang of ['ҚЗ', 'EN', 'RU']) {
      await page.click(`#langBox span:has-text("${lang}")`);
      await expect(page.locator('.hero')).toBeVisible();
      await expect(page.locator('.nav-logo-text')).toBeVisible();
    }
  });

  test('FN-08 | Кнопка КП в навигации переводится', async ({ page }) => {
    await goto(page);
    await expect(page.locator('.nav-cta')).toContainText('КП');
    await page.click('#langBox span:has-text("EN")');
    await expect(page.locator('.nav-cta')).toContainText('QUOTE');
  });

  test('FN-09 | Переводы в секции "Почему выбирают нас"', async ({ page }) => {
    await goto(page);
    const titleRu = await page.locator('[data-k="why_t2"]').first().textContent();
    await page.click('#langBox span:has-text("EN")');
    const titleEn = await page.locator('[data-k="why_t2"]').first().textContent();
    expect(titleRu).not.toBe(titleEn);
  });

  test('FN-10 | Переводы в футере', async ({ page }) => {
    await goto(page);
    const footerRu = await page.locator('[data-k="fc_cat"]').first().textContent();
    await page.click('#langBox span:has-text("EN")');
    const footerEn = await page.locator('[data-k="fc_cat"]').first().textContent();
    expect(footerRu).toBe('Каталог');
    expect(footerEn).toBe('Catalog');
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('📦 FUNCTIONAL: Каталог продукции', () => {

  test('FN-11 | Отображаются все 6 карточек продуктов', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.cat-grid .cat-card');
    await expect(cards).toHaveCount(6);
  });

  test('FN-12 | Каждая карточка имеет номер, название и спецификацию', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.cat-grid .cat-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const num = await card.locator('.cat-num').textContent();
      const name = await card.locator('.cat-name').textContent();
      const spec = await card.locator('.cat-spec').textContent();
      expect(num?.trim()).toMatch(/\d{2}/);
      expect(name?.trim().length).toBeGreaterThan(2);
      expect(spec).toContain('DN');
    }
  });

  test('FN-13 | Все 5 кнопок фильтрации присутствуют', async ({ page }) => {
    await goto(page);
    const btns = page.locator('.filter-btn');
    await expect(btns).toHaveCount(5);
  });

  test('FN-14 | Первый фильтр "Все" активен по умолчанию', async ({ page }) => {
    await goto(page);
    const first = page.locator('.filter-btn').first();
    await expect(first).toHaveClass(/active/);
  });

  test('FN-15 | Клик по фильтру "Задвижки" активирует его', async ({ page }) => {
    await goto(page);
    await page.click('.filter-btn:has-text("Задвижки")');
    const active = page.locator('.filter-btn.active');
    await expect(active).toContainText('Задвижки');
  });

  test('FN-16 | Только один фильтр активен одновременно', async ({ page }) => {
    await goto(page);
    await page.click('.filter-btn:nth-child(3)');
    const activeFilters = page.locator('.filter-btn.active');
    await expect(activeFilters).toHaveCount(1);
  });

  test('FN-17 | Hover на карточку — появляется стрелка "↗"', async ({ page }) => {
    await goto(page);
    const firstCard = page.locator('.cat-card').first();
    await firstCard.hover();
    const arrow = firstCard.locator('.cat-arrow');
    // Стрелка должна быть в DOM
    await expect(arrow).toBeAttached();
  });

  test('FN-18 | Карточки имеют бейджи (ГОСТ, PN и т.д.)', async ({ page }) => {
    await goto(page);
    const badges = page.locator('.cat-card .badge');
    const count = await badges.count();
    expect(count).toBeGreaterThan(5);
  });

  test('FN-19 | Кнопка "ПОЛНЫЙ КАТАЛОГ" присутствует', async ({ page }) => {
    await goto(page);
    const btn = page.locator('.btn-link').first();
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('КАТАЛОГ');
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('⚙️ FUNCTIONAL: Инструмент подбора арматуры', () => {

  test('FN-20 | Форма подбора имеет 4 поля', async ({ page }) => {
    await goto(page);
    const selects = page.locator('.selector-section .tool-sel');
    await expect(selects).toHaveCount(4);
  });

  test('FN-21 | До выбора среды — результат скрыт', async ({ page }) => {
    await goto(page);
    const result = page.locator('#toolResult');
    await expect(result).not.toHaveClass(/show/);
  });

  test('FN-22 | После выбора "Вода" — появляется рекомендация', async ({ page }) => {
    await goto(page);
    await page.selectOption('#medium', 'water');
    const result = page.locator('#toolResult');
    await expect(result).toHaveClass(/show/);
  });

  test('FN-23 | Рекомендация содержит название арматуры', async ({ page }) => {
    await goto(page);
    await page.selectOption('#medium', 'water');
    const text = await page.locator('#toolResultText').textContent();
    expect(text?.length).toBeGreaterThan(5);
  });

  test('FN-24 | Рекомендации различаются для разных сред', async ({ page }) => {
    await goto(page);
    await page.selectOption('#medium', 'water');
    const textWater = await page.locator('#toolResultText').textContent();
    await page.selectOption('#medium', 'oil');
    const textOil = await page.locator('#toolResultText').textContent();
    expect(textWater).not.toBe(textOil);
  });

  test('FN-25 | Выбор DN влияет на рекомендацию', async ({ page }) => {
    await goto(page);
    await page.selectOption('#medium', 'water');
    await page.selectOption('#dn', 's');
    const textSmall = await page.locator('#toolResultText').textContent();
    await page.selectOption('#dn', 'xl');
    const textXL = await page.locator('#toolResultText').textContent();
    expect(textSmall).not.toBe(textXL);
  });

  test('FN-26 | При выборе PN добавляется в результат', async ({ page }) => {
    await goto(page);
    await page.selectOption('#medium', 'oil');
    await page.selectOption('#pn', 'PN25');
    const text = await page.locator('#toolResultText').textContent();
    expect(text).toContain('PN25');
  });

  test('FN-27 | Кнопка "ОПРОСНЫЙ ЛИСТ" открывает модальное окно', async ({ page }) => {
    await goto(page);
    await page.click('.selector-section .btn-tool');
    const modal = page.locator('#modal');
    await expect(modal).toHaveClass(/open/);
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('📋 FUNCTIONAL: Модальное окно (опросный лист)', () => {

  test('FN-28 | Модальное окно открывается по клику на кнопку "КП"', async ({ page }) => {
    await goto(page);
    await page.click('.nav-cta');
    await expect(page.locator('#modal')).toHaveClass(/open/);
  });

  test('FN-29 | Модальное окно содержит заголовок', async ({ page }) => {
    await goto(page);
    await page.click('.nav-cta');
    await expect(page.locator('.modal-title')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText('ОПРОСНЫЙ');
  });

  test('FN-30 | Модальное окно закрывается по кнопке "×"', async ({ page }) => {
    await goto(page);
    await page.click('.nav-cta');
    await expect(page.locator('#modal')).toHaveClass(/open/);
    await page.click('.modal-x');
    await expect(page.locator('#modal')).not.toHaveClass(/open/);
  });

  test('FN-31 | Модальное закрывается по клику на overlay', async ({ page }) => {
    await goto(page);
    await page.click('.nav-cta');
    await page.click('.overlay', { position: { x: 5, y: 5 } });
    await expect(page.locator('#modal')).not.toHaveClass(/open/);
  });

  test('FN-32 | Форма содержит поля: имя, телефон, компания', async ({ page }) => {
    await goto(page);
    await page.click('.nav-cta');
    await expect(page.locator('.modal input[type="text"]').first()).toBeVisible();
    await expect(page.locator('.modal input[type="tel"]')).toBeVisible();
  });

  test('FN-33 | В поля можно вводить текст', async ({ page }) => {
    await goto(page);
    await page.click('.nav-cta');
    const nameInput = page.locator('.modal input[type="text"]').first();
    await nameInput.fill('Асет Жаксыбеков');
    await expect(nameInput).toHaveValue('Асет Жаксыбеков');
  });

  test('FN-34 | Выпадающий список типов арматуры работает', async ({ page }) => {
    await goto(page);
    await page.click('.nav-cta');
    const select = page.locator('.modal select').first();
    await select.selectOption({ index: 1 });
    const value = await select.inputValue();
    expect(value).not.toBe('');
  });

  test('FN-35 | Тип арматуры переводится в модальном окне (EN)', async ({ page }) => {
    await goto(page);
    await page.click('#langBox span:has-text("EN")');
    await page.click('.nav-cta');
    const title = await page.locator('.modal-title').textContent();
    expect(title?.toUpperCase()).toContain('QUESTIONNAIRE');
  });

  test('FN-36 | Модальное открывается из разных мест (hero + PDF-баннер)', async ({ page }) => {
    await goto(page);
    // Из hero
    await page.click('.btn-hero-primary');
    await expect(page.locator('#modal')).toHaveClass(/open/);
    await page.click('.modal-x');
    // Из PDF-баннера
    await page.click('.btn-pdf-outline');
    await expect(page.locator('#modal')).toHaveClass(/open/);
    await page.click('.modal-x');
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('🗂️ FUNCTIONAL: Секции контента', () => {

  test('FN-37 | Stats Bar отображает 5 статистик', async ({ page }) => {
    await goto(page);
    const stats = page.locator('.stat-box');
    await expect(stats).toHaveCount(5);
  });

  test('FN-38 | Каждая статистика имеет значение и подпись', async ({ page }) => {
    await goto(page);
    const boxes = page.locator('.stat-box');
    const count = await boxes.count();
    for (let i = 0; i < count; i++) {
      const val = await boxes.nth(i).locator('.stat-val').textContent();
      const lbl = await boxes.nth(i).locator('.stat-lbl').textContent();
      expect(val?.trim().length).toBeGreaterThan(0);
      expect(lbl?.trim().length).toBeGreaterThan(0);
    }
  });

  test('FN-39 | Отображаются все 6 объектов в секции "Проекты"', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.proj-grid .proj-card');
    await expect(cards).toHaveCount(6);
  });

  test('FN-40 | Каждый объект имеет город и описание', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.proj-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const city = await cards.nth(i).locator('.proj-city').textContent();
      const name = await cards.nth(i).locator('.proj-name').textContent();
      expect(city?.trim().length).toBeGreaterThan(3);
      expect(name?.trim().length).toBeGreaterThan(3);
    }
  });

  test('FN-41 | Отображаются 3 отзыва клиентов', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.testi-card');
    await expect(cards).toHaveCount(3);
  });

  test('FN-42 | Каждый отзыв содержит текст, имя и должность', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.testi-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).locator('.testi-text').textContent();
      const name = await cards.nth(i).locator('.testi-name').textContent();
      const role = await cards.nth(i).locator('.testi-role').textContent();
      expect(text?.trim().length).toBeGreaterThan(20);
      expect(name?.trim().length).toBeGreaterThan(3);
      expect(role?.trim().length).toBeGreaterThan(3);
    }
  });

  test('FN-43 | Отображаются 3 статьи в блоге', async ({ page }) => {
    await goto(page);
    const articles = page.locator('.blog .art-card');
    await expect(articles).toHaveCount(3);
  });

  test('FN-44 | Отображаются 6 городов доставки', async ({ page }) => {
    await goto(page);
    const cities = page.locator('.city-item');
    await expect(cities).toHaveCount(6);
  });

  test('FN-45 | Каждый город имеет название и срок', async ({ page }) => {
    await goto(page);
    const cities = page.locator('.city-item');
    const count = await cities.count();
    for (let i = 0; i < count; i++) {
      const name = await cities.nth(i).locator('.city-name').textContent();
      const time = await cities.nth(i).locator('.city-time').textContent();
      expect(name?.trim().length).toBeGreaterThan(2);
      expect(time?.trim().length).toBeGreaterThan(2);
    }
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('📞 FUNCTIONAL: Контакты и CTA', () => {

  test('FN-46 | Контактная форма содержит кнопку отправки', async ({ page }) => {
    await goto(page);
    const btn = page.locator('.btn-submit');
    await expect(btn).toBeVisible();
  });

  test('FN-47 | Поля контактной формы доступны для ввода', async ({ page }) => {
    await goto(page);
    const inputs = page.locator('.contact-form .inp[type="text"]');
    await expect(inputs.first()).toBeEditable();
  });

  test('FN-48 | WhatsApp ссылка ведёт на wa.me', async ({ page }) => {
    await goto(page);
    const wa = page.locator('.wa-float');
    const href = await wa.getAttribute('href');
    expect(href).toContain('wa.me');
    expect(href).toContain('77078555511');
  });

  test('FN-49 | Телефон в контактной секции виден', async ({ page }) => {
    await goto(page);
    const phone = page.locator('.contact-left .c-val').first();
    await expect(phone).toBeVisible();
    await expect(phone).toContainText('+7');
  });

  test('FN-50 | Email в контактной секции виден', async ({ page }) => {
    await goto(page);
    const email = page.locator('.c-val').nth(1);
    await expect(email).toBeVisible();
    await expect(email).toContainText('@');
  });

  test('FN-51 | Адрес в контактной секции виден', async ({ page }) => {
    await goto(page);
    const addr = page.locator('[data-k="c_ad"]').first();
    await expect(addr).toBeVisible();
    await expect(addr).toContainText('Астана');
  });

  test('FN-52 | Кнопка PDF в баннере присутствует', async ({ page }) => {
    await goto(page);
    const btn = page.locator('.btn-pdf').first();
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('PDF');
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('🧭 FUNCTIONAL: Навигация и мегаменю', () => {

  test('FN-53 | При наведении на "Каталог" появляется мегаменю', async ({ page }) => {
    await goto(page);
    const catalogLink = page.locator('.nav-links > li > a').first();
    await catalogLink.hover();
    const mega = page.locator('.megamenu').first();
    await expect(mega).toBeVisible();
  });

  test('FN-54 | Мегаменю содержит 6 пунктов продуктов', async ({ page }) => {
    await goto(page);
    const catalogLink = page.locator('.nav-links > li > a').first();
    await catalogLink.hover();
    const items = page.locator('.megamenu .mega-item');
    await expect(items).toHaveCount(6);
  });

  test('FN-55 | Каждый пункт мегаменю имеет DN-спецификацию', async ({ page }) => {
    await goto(page);
    await page.locator('.nav-links > li > a').first().hover();
    const specs = page.locator('.megamenu .mega-spec');
    const count = await specs.count();
    for (let i = 0; i < count; i++) {
      const spec = await specs.nth(i).textContent();
      expect(spec).toContain('DN');
    }
  });

  test('FN-56 | Стрелка в пункте навигации видна', async ({ page }) => {
    await goto(page);
    const arrow = page.locator('.nav-arrow').first();
    await expect(arrow).toBeVisible();
  });

  test('FN-57 | Логотип кликабелен (href="#")', async ({ page }) => {
    await goto(page);
    const logo = page.locator('.nav-logo');
    const href = await logo.getAttribute('href');
    expect(href).toBe('#');
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('♿ FUNCTIONAL: Доступность (A11y)', () => {

  test('FN-58 | lang атрибут установлен на html-элементе', async ({ page }) => {
    await goto(page);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(['ru', 'kk', 'en']).toContain(lang);
  });

  test('FN-59 | После смены языка lang меняется', async ({ page }) => {
    await goto(page);
    await page.click('#langBox span:has-text("EN")');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('FN-60 | Все интерактивные элементы кликабельны', async ({ page }) => {
    await goto(page);
    // Проверяем ключевые кнопки
    const buttons = ['.nav-cta', '.btn-hero-primary', '.btn-tool'];
    for (const sel of buttons) {
      const el = page.locator(sel).first();
      await expect(el).toBeEnabled();
    }
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('⚡ FUNCTIONAL: Производительность (базовая)', () => {

  test('FN-61 | Страница загружается менее чем за 5 секунд', async ({ page }) => {
    const start = Date.now();
    await page.goto(INDEX_URL, { waitUntil: 'load' });
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  test('FN-62 | DOM готов менее чем за 2 секунды', async ({ page }) => {
    const start = Date.now();
    await page.goto(INDEX_URL, { waitUntil: 'domcontentloaded' });
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });

  test('FN-63 | Страница не имеет критических JS-ошибок', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(INDEX_URL, { waitUntil: 'load' });
    expect(errors).toHaveLength(0);
  });

  test('FN-64 | CSS шрифты загружены (элементы имеют не нулевую высоту)', async ({ page }) => {
    await page.goto(INDEX_URL, { waitUntil: 'load' });
    const heroHeight = await page.locator('.hero-h1').evaluate(
      (el) => el.getBoundingClientRect().height
    );
    expect(heroHeight).toBeGreaterThan(0);
  });
});
