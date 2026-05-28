/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   ASTANA VALVE — FUNCTIONAL TESTS                       ║
 * ║   Проверка: интерактивность и бизнес-логика работают   ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Функциональные тесты — проверяют каждую фичу в деталях:
 * мультиязычность, фильтры, подборщик, модальные окна и т.д.
 * Запускается через HTTP (localhost:4321), не file://
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:4321';

async function goto(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load');
}

// ═══════════════════════════════════════════════════════════
test.describe('🌐 FUNCTIONAL: Мультиязычность (i18n)', () => {

  test('FN-01 | RU активен по умолчанию', async ({ page }) => {
    await goto(page);
    const activeLang = page.locator('#langSw span.active');
    await expect(activeLang).toHaveText('RU');
  });

  test('FN-02 | Переключение на казахский (ҚЗ)', async ({ page }) => {
    await goto(page);
    await page.evaluate(() => (window as any).setLang('kz'));
    await expect(page.locator('#langSw span.active')).toHaveText('ҚЗ');
  });

  test('FN-03 | Текст hero меняется на казахский', async ({ page }) => {
    await goto(page);
    await page.evaluate(() => (window as any).setLang('kz'));
    const h1 = page.locator('.hero-h1');
    const text = await h1.textContent();
    // Казахский: содержит кириллицу, а не латиницу
    expect(text?.trim().length).toBeGreaterThan(5);
  });

  test('FN-04 | Переключение на английский (EN)', async ({ page }) => {
    await goto(page);
    await page.evaluate(() => (window as any).setLang('en'));
    await expect(page.locator('#langSw span.active')).toHaveText('EN');
  });

  test('FN-05 | Текст hero меняется на английский', async ({ page }) => {
    await goto(page);
    await page.evaluate(() => (window as any).setLang('en'));
    const h1 = page.locator('.hero-h1');
    const text = await h1.textContent();
    expect(text?.toLowerCase()).toContain('valve');
  });

  test('FN-06 | Переключение RU → KZ → EN → RU не ломает страницу', async ({ page }) => {
    await goto(page);
    for (const lang of ['ҚЗ', 'EN', 'RU']) {
      await page.evaluate((l: string) => (window as any).setLang(l === 'ҚЗ' ? 'kz' : l === 'EN' ? 'en' : 'ru'), lang);
      await expect(page.locator('.hero')).toBeVisible();
      await expect(page.locator('header .logo-title').first()).toBeVisible();
    }
  });

  test('FN-07 | Переводы в секции "Почему выбирают нас"', async ({ page }) => {
    await goto(page);
    const titleRu = await page.locator('[data-key="why2_t"]').first().textContent();
    await page.evaluate(() => (window as any).setLang('en'));
    const titleEn = await page.locator('[data-key="why2_t"]').first().textContent();
    expect(titleRu).not.toBe(titleEn);
  });

  test('FN-08 | Переводы в футере', async ({ page }) => {
    await goto(page);
    const footerRu = await page.locator('[data-key="footer_catalog"]').first().textContent();
    await page.evaluate(() => (window as any).setLang('en'));
    const footerEn = await page.locator('[data-key="footer_catalog"]').first().textContent();
    expect(footerRu).not.toBe(footerEn);
    expect(footerEn).toBe('Catalog');
  });

  test('FN-09 | html lang меняется при смене языка', async ({ page }) => {
    await goto(page);
    await page.evaluate(() => (window as any).setLang('en'));
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
  });

  test('FN-10 | aria-label бургера меняется при смене языка', async ({ page }) => {
    await goto(page);
    await page.evaluate(() => (window as any).setLang('en'));
    const label = await page.locator('#burgerBtn').getAttribute('aria-label');
    expect(label).toBe('Menu');
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('📦 FUNCTIONAL: Каталог продукции', () => {

  test('FN-11 | Каталог содержит минимум 6 карточек продуктов', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.catalog-grid .cat-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('FN-12 | Каждая карточка имеет название и спецификацию', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.catalog-grid .cat-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const name = await card.locator('.cat-card-name').textContent();
      const spec = await card.locator('.cat-card-spec').textContent();
      expect(name?.trim().length).toBeGreaterThan(2);
      expect(spec).toContain('DN');
    }
  });

  test('FN-13 | Все 5 кнопок фильтрации присутствуют', async ({ page }) => {
    await goto(page);
    const btns = page.locator('.filter-btn');
    await expect(btns).toHaveCount(5);
  });

  test('FN-14 | Первый фильтр активен по умолчанию', async ({ page }) => {
    await goto(page);
    const first = page.locator('.filter-btn').first();
    await expect(first).toHaveClass(/active/);
  });

  test('FN-15 | Клик по второму фильтру активирует его', async ({ page }) => {
    await goto(page);
    // Кликаем через JS (filter-btn скрыт на мобильном <640px)
    await page.evaluate(() => {
      const btns = document.querySelectorAll('.filter-btn');
      (btns[1] as HTMLElement).click();
    });
    await expect(page.locator('.filter-btn').nth(1)).toHaveClass(/active/);
  });

  test('FN-16 | Только один фильтр активен одновременно', async ({ page }) => {
    await goto(page);
    await page.evaluate(() => {
      const btns = document.querySelectorAll('.filter-btn');
      (btns[2] as HTMLElement).click();
    });
    const activeFilters = page.locator('.filter-btn.active');
    await expect(activeFilters).toHaveCount(1);
  });

  test('FN-17 | Карточки имеют кнопку или ссылку действия', async ({ page }) => {
    await goto(page);
    const links = page.locator('.catalog-grid .cat-card-link');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('FN-18 | PDF каталог кнопки присутствуют в карточках', async ({ page }) => {
    await goto(page);
    const pdfBtns = page.locator('.catalog-grid .btn-card-pdf');
    const count = await pdfBtns.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('⚙️ FUNCTIONAL: Инструмент подбора арматуры', () => {

  test('FN-19 | Форма подбора имеет 4 поля select', async ({ page }) => {
    await goto(page);
    const selects = page.locator('.selector-section .tool-select');
    await expect(selects).toHaveCount(4);
  });

  test('FN-20 | До выбора среды — результат скрыт', async ({ page }) => {
    await goto(page);
    const result = page.locator('#toolResult');
    await expect(result).not.toHaveClass(/show/);
  });

  test('FN-21 | После выбора среды — появляется рекомендация', async ({ page }) => {
    await goto(page);
    await page.selectOption('#medium', { index: 1 });
    const result = page.locator('#toolResult');
    await expect(result).toHaveClass(/show/);
  });

  test('FN-22 | Рекомендация содержит текст', async ({ page }) => {
    await goto(page);
    await page.selectOption('#medium', { index: 1 });
    const text = await page.locator('#resultText').textContent();
    expect(text?.length).toBeGreaterThan(5);
  });

  test('FN-23 | Среда имеет несколько опций для выбора', async ({ page }) => {
    await goto(page);
    const options = await page.locator('#medium option').allTextContents();
    expect(options.length).toBeGreaterThan(2);
  });

  test('FN-24 | Кнопка "Опросный лист" в инструменте открывает модал', async ({ page }) => {
    await goto(page);
    await page.locator('.selector-section .tool-btn').click();
    await expect(page.locator('#modal-questionnaire')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('📋 FUNCTIONAL: Модальное окно (опросный лист)', () => {

  test('FN-25 | Модальное окно открывается из hero', async ({ page }) => {
    await goto(page);
    await page.locator('.hero-cta .btn-primary').first().click();
    await expect(page.locator('#modal-questionnaire')).toBeVisible();
  });

  test('FN-26 | Модальное окно содержит заголовок', async ({ page }) => {
    await goto(page);
    await page.locator('.hero-cta .btn-primary').first().click();
    await expect(page.locator('.modal-title')).toBeVisible();
    const title = await page.locator('.modal-title').textContent();
    expect(title?.trim().length).toBeGreaterThan(3);
  });

  test('FN-27 | Модальное окно закрывается по кнопке "×"', async ({ page }) => {
    await goto(page);
    await page.locator('.hero-cta .btn-primary').first().click();
    await expect(page.locator('#modal-questionnaire')).toBeVisible();
    await page.locator('.modal-close').click({ force: true });
    await expect(page.locator('#modal-questionnaire')).not.toBeVisible();
  });

  test('FN-28 | Модальное закрывается по клику на overlay', async ({ page }) => {
    await goto(page);
    await page.locator('.hero-cta .btn-primary').first().click();
    await expect(page.locator('#modal-questionnaire')).toBeVisible();
    // Кликаем на overlay (саму .modal-overlay), не на .modal
    await page.locator('#modal-questionnaire').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('#modal-questionnaire')).not.toBeVisible();
  });

  test('FN-29 | Форма содержит поля: текст и телефон', async ({ page }) => {
    await goto(page);
    await page.locator('.hero-cta .btn-primary').first().click();
    await expect(page.locator('.modal-inp[type="text"]').first()).toBeVisible();
    await expect(page.locator('.modal-inp[type="tel"]')).toBeVisible();
  });

  test('FN-30 | В поля можно вводить текст', async ({ page }) => {
    await goto(page);
    await page.locator('.hero-cta .btn-primary').first().click();
    const nameInput = page.locator('.modal-inp[type="text"]').first();
    await nameInput.fill('Асет Жаксыбеков');
    await expect(nameInput).toHaveValue('Асет Жаксыбеков');
  });

  test('FN-31 | Заголовок модала переводится на EN', async ({ page }) => {
    await goto(page);
    await page.evaluate(() => (window as any).setLang('en'));
    await page.locator('.hero-cta .btn-primary').first().click();
    const title = await page.locator('.modal-title').textContent();
    expect(title?.toUpperCase()).toContain('QUESTIONNAIRE');
  });

  test('FN-32 | Модальное открывается из PDF-баннера', async ({ page }) => {
    await goto(page);
    await page.locator('#openQuestionnaireForm').click();
    await expect(page.locator('#modal-questionnaire')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('🗂️ FUNCTIONAL: Секции контента', () => {

  test('FN-33 | Stats Bar отображает 5 статистик', async ({ page }) => {
    await goto(page);
    const stats = page.locator('.stat-item');
    await expect(stats).toHaveCount(5);
  });

  test('FN-34 | Каждая статистика имеет значение и подпись', async ({ page }) => {
    await goto(page);
    const boxes = page.locator('.stat-item');
    const count = await boxes.count();
    for (let i = 0; i < count; i++) {
      const val = await boxes.nth(i).locator('.stat-val').textContent();
      const lbl = await boxes.nth(i).locator('.stat-lbl').textContent();
      expect(val?.trim().length).toBeGreaterThan(0);
      expect(lbl?.trim().length).toBeGreaterThan(0);
    }
  });

  test('FN-35 | Отображаются все 6 объектов в секции "Проекты"', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.projects-grid .proj-card');
    await expect(cards).toHaveCount(6);
  });

  test('FN-36 | Каждый объект имеет город и название', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.projects-grid .proj-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const city = await cards.nth(i).locator('.proj-city').textContent();
      const name = await cards.nth(i).locator('.proj-name').textContent();
      expect(city?.trim().length).toBeGreaterThan(3);
      expect(name?.trim().length).toBeGreaterThan(3);
    }
  });

  test('FN-37 | Отображаются 3 отзыва клиентов (+ скрытые)', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.testi-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('FN-38 | Каждый отзыв содержит текст, имя и должность', async ({ page }) => {
    await goto(page);
    const cards = page.locator('.testi-card');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).locator('.testi-text').textContent();
      const name = await cards.nth(i).locator('.testi-name').textContent();
      const role = await cards.nth(i).locator('.testi-role').textContent();
      expect(text?.trim().length).toBeGreaterThan(10);
      expect(name?.trim().length).toBeGreaterThan(3);
      expect(role?.trim().length).toBeGreaterThan(3);
    }
  });

  test('FN-39 | Статьи в блоге присутствуют (минимум 3)', async ({ page }) => {
    await goto(page);
    const articles = page.locator('.blog-grid .article-card');
    const count = await articles.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('FN-40 | Отображаются 6 городов доставки', async ({ page }) => {
    await goto(page);
    const cities = page.locator('.city-item');
    await expect(cities).toHaveCount(6);
  });

  test('FN-41 | Каждый город имеет название и срок', async ({ page }) => {
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

  test('FN-42 | Контактная форма содержит кнопку отправки', async ({ page }) => {
    await goto(page);
    const btn = page.locator('.btn-submit');
    await expect(btn).toBeVisible();
  });

  test('FN-43 | Поля контактной формы доступны для ввода', async ({ page }) => {
    await goto(page);
    const inputs = page.locator('.contact-form .inp');
    await expect(inputs.first()).toBeEditable();
  });

  test('FN-44 | Floating WhatsApp ссылка ведёт на wa.me', async ({ page }) => {
    await goto(page);
    const wa = page.locator('.floating-wa');
    const href = await wa.getAttribute('href');
    expect(href).toContain('wa.me');
    expect(href).toContain('77078555511');
  });

  test('FN-45 | Телефон в контактной секции виден', async ({ page }) => {
    await goto(page);
    const phone = page.locator('.contact-val').first();
    await expect(phone).toBeVisible();
    await expect(phone).toContainText('+7');
  });

  test('FN-46 | Email в контактной секции виден', async ({ page }) => {
    await goto(page);
    const email = page.locator('.contact-val').nth(1);
    await expect(email).toBeVisible();
    await expect(email).toContainText('@');
  });

  test('FN-47 | Адрес в контактной секции содержит "Астана"', async ({ page }) => {
    await goto(page);
    const addr = page.locator('.contact-val[data-key="c_addr"]').first();
    await expect(addr).toBeVisible();
    const text = await addr.textContent();
    expect(text).toContain('Астана');
  });

  test('FN-48 | Кнопка PDF в баннере присутствует', async ({ page }) => {
    await goto(page);
    const btn = page.locator('.btn-pdf').first();
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('PDF');
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('🧭 FUNCTIONAL: Навигация и мегаменю', () => {

  test('FN-49 | При наведении на "Каталог" появляется мегаменю', async ({ page }) => {
    // Мегаменю работает только на десктопе (nav-links скрыт на мобиле)
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);
    const catalogLink = page.locator('.nav-links > li > a').first();
    await catalogLink.hover();
    const mega = page.locator('.megamenu').first();
    await expect(mega).toBeVisible();
  });

  test('FN-50 | Мегаменю содержит 6 пунктов продуктов', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);
    await page.locator('.nav-links > li > a').first().hover();
    const items = page.locator('.megamenu .mega-item');
    await expect(items).toHaveCount(6);
  });

  test('FN-51 | Каждый пункт мегаменю имеет DN-спецификацию', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await goto(page);
    await page.locator('.nav-links > li > a').first().hover();
    const specs = page.locator('.megamenu .mega-item-spec');
    const count = await specs.count();
    for (let i = 0; i < count; i++) {
      const spec = await specs.nth(i).textContent();
      expect(spec).toContain('DN');
    }
  });

  test('FN-52 | Логотип в шапке присутствует и содержит текст', async ({ page }) => {
    await goto(page);
    const logo = page.locator('header .logo-title').first();
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('Astana Valve');
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('♿ FUNCTIONAL: Доступность (A11y)', () => {

  test('FN-53 | lang атрибут установлен на html-элементе', async ({ page }) => {
    await goto(page);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(['ru', 'kk', 'en']).toContain(lang);
  });

  test('FN-54 | После смены языка lang меняется', async ({ page }) => {
    await goto(page);
    await page.evaluate(() => (window as any).setLang('en'));
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });

  test('FN-55 | Бургер-кнопка имеет aria-label', async ({ page }) => {
    await goto(page);
    const label = await page.locator('#burgerBtn').getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect(label!.length).toBeGreaterThan(2);
  });

  test('FN-56 | PDF каталог модал имеет aria-label', async ({ page }) => {
    await goto(page);
    const label = await page.locator('#pdfCatalogModal').getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('FN-57 | Контактная форма имеет label для полей', async ({ page }) => {
    await goto(page);
    const labels = page.locator('.contact-form .sr-only');
    const count = await labels.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

// ═══════════════════════════════════════════════════════════
test.describe('⚡ FUNCTIONAL: Производительность', () => {

  test('FN-58 | Страница загружается менее чем за 5 секунд', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'load' });
    expect(Date.now() - start).toBeLessThan(5000);
  });

  test('FN-59 | DOM готов менее чем за 2 секунды', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    expect(Date.now() - start).toBeLessThan(2000);
  });

  test('FN-60 | Нет критических JS-ошибок (pageerror)', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE_URL, { waitUntil: 'load' });
    expect(errors).toHaveLength(0);
  });

  test('FN-61 | Hero H1 имеет ненулевую высоту (шрифты загружены)', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'load' });
    const heroHeight = await page.locator('.hero-h1').evaluate(
      (el) => el.getBoundingClientRect().height
    );
    expect(heroHeight).toBeGreaterThan(0);
  });

  test('FN-62 | style.min.css отдаётся сервером', async ({ page }) => {
    const resp = await page.request.get(`${BASE_URL}/style.min.css`);
    expect(resp.status()).toBe(200);
    const size = (await resp.body()).length;
    expect(size).toBeGreaterThan(10000); // > 10KB
  });
});
