#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════╗
║   ASTANA VALVE — PLAYWRIGHT TEST RUNNER                      ║
║   Smoke + Functional tests via Python Playwright             ║
║   Запуск: python3 tests/run_tests.py                         ║
╚══════════════════════════════════════════════════════════════╝
"""

import sys
import os
import json
import time
from pathlib import Path
from datetime import datetime
from playwright.sync_api import sync_playwright, Page, Browser

# ─── CONFIG ───────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
HTML_FILE    = PROJECT_ROOT / "src" / "index.html"
FILE_URL     = f"file://{HTML_FILE.resolve()}"
RESULTS_DIR  = PROJECT_ROOT / "test-results"
RESULTS_DIR.mkdir(exist_ok=True)

# ─── COLOURS ──────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
BLUE   = "\033[94m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

# ─── TEST REGISTRY ────────────────────────────────────────────
all_tests   = []
test_results = []

def test(name: str, suite: str = "General"):
    """Декоратор для регистрации теста"""
    def decorator(fn):
        all_tests.append({"name": name, "suite": suite, "fn": fn})
        return fn
    return decorator

def expect_true(condition, message=""):
    if not condition:
        raise AssertionError(message or "Expected True, got False")

def expect_contains(text, substring, msg=""):
    if substring not in str(text):
        raise AssertionError(msg or f"Expected '{substring}' in '{str(text)[:80]}'")

def expect_count(locator, expected):
    count = locator.count()
    if count != expected:
        raise AssertionError(f"Expected {expected} elements, got {count}")

def expect_visible(locator, name="element"):
    if not locator.is_visible():
        raise AssertionError(f"{name} is not visible")

def expect_not_class(locator, cls_name, name="element"):
    try:
        classes = locator.get_attribute("class") or ""
    except Exception:
        classes = ""
    if cls_name in classes:
        raise AssertionError(f"{name} should NOT have class '{cls_name}'")

def expect_has_class(locator, cls_name, name="element"):
    try:
        classes = locator.get_attribute("class") or ""
    except Exception:
        classes = ""
    if cls_name not in classes:
        raise AssertionError(f"{name} should have class '{cls_name}' (got: '{classes}')")

# ═══════════════════════════════════════════════════════════════
#   🔥 SMOKE TESTS
# ═══════════════════════════════════════════════════════════════

@test("SM-01 | Страница загружается без JS-ошибок", "🔥 SMOKE: Загрузка")
def test_page_loads(page: Page):
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(FILE_URL, wait_until="domcontentloaded")
    expect_true(len(errors) == 0, f"JS ошибки: {errors}")

@test("SM-02 | Title содержит 'Astana Valve'", "🔥 SMOKE: Загрузка")
def test_title(page: Page):
    page.goto(FILE_URL)
    expect_contains(page.title(), "Astana Valve")

@test("SM-03 | Meta description не пустой и упоминает Казахстан", "🔥 SMOKE: Загрузка")
def test_meta_desc(page: Page):
    page.goto(FILE_URL)
    desc = page.locator('meta[name="description"]').get_attribute("content")
    expect_true(desc and len(desc) > 10, "Meta description пустой")
    expect_contains(desc, "Казахстан")

@test("SM-04 | Charset UTF-8 (поддержка кириллицы)", "🔥 SMOKE: Загрузка")
def test_charset(page: Page):
    page.goto(FILE_URL)
    charset = page.locator('meta[charset]').get_attribute("charset")
    expect_true(charset and charset.upper() == "UTF-8", f"Charset: {charset}")

@test("SM-05 | Viewport meta присутствует", "🔥 SMOKE: Загрузка")
def test_viewport(page: Page):
    page.goto(FILE_URL)
    vp = page.locator('meta[name="viewport"]').get_attribute("content")
    expect_contains(vp, "width=device-width")

@test("SM-06 | Логотип ASTANA VALVE виден", "🔥 SMOKE: Навигация")
def test_logo(page: Page):
    page.goto(FILE_URL)
    logo = page.locator(".nav-logo-text")
    expect_visible(logo, "Логотип")
    text = logo.text_content()
    expect_contains(text, "ASTANA")

@test("SM-07 | Навигация содержит минимум 5 пунктов", "🔥 SMOKE: Навигация")
def test_nav_links(page: Page):
    page.goto(FILE_URL)
    links = page.locator(".nav-links > li > a")
    count = links.count()
    expect_true(count >= 5, f"Навигационных ссылок: {count} (ожидается ≥5)")

@test("SM-08 | Языковой переключатель RU/ҚЗ/EN виден", "🔥 SMOKE: Навигация")
def test_lang_switcher(page: Page):
    page.goto(FILE_URL)
    langs = page.locator("#langBox span")
    expect_count(langs, 3)
    texts = langs.all_text_contents()
    expect_contains(texts, "RU")
    expect_contains(texts, "ҚЗ")
    expect_contains(texts, "EN")

@test("SM-09 | Кнопка КП в навигации видна", "🔥 SMOKE: Навигация")
def test_nav_cta(page: Page):
    page.goto(FILE_URL)
    cta = page.locator(".nav-cta")
    expect_visible(cta, "Кнопка КП")

@test("SM-10 | Телефон в навигации содержит +7", "🔥 SMOKE: Навигация")
def test_nav_phone(page: Page):
    page.goto(FILE_URL)
    phone = page.locator(".nav-phone-num")
    expect_visible(phone, "Телефон в nav")
    expect_contains(phone.text_content(), "+7")

@test("SM-11 | Hero-секция видна", "🔥 SMOKE: Hero")
def test_hero_visible(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".hero"), "Hero секция")

@test("SM-12 | H1 содержит текст", "🔥 SMOKE: Hero")
def test_h1(page: Page):
    page.goto(FILE_URL)
    h1 = page.locator(".hero-h1")
    expect_visible(h1, "H1")
    expect_true(len(h1.text_content().strip()) > 3, "H1 пустой")

@test("SM-13 | Кнопка 'ПОДОБРАТЬ АРМАТУРУ' видна", "🔥 SMOKE: Hero")
def test_hero_btn1(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".btn-hero-primary"), "btn-hero-primary")

@test("SM-14 | Кнопка 'СКАЧАТЬ КАТАЛОГ' видна", "🔥 SMOKE: Hero")
def test_hero_btn2(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".btn-hero-outline"), "btn-hero-outline")

@test("SM-15 | Promo-бар виден", "🔥 SMOKE: Секции")
def test_promo_bar(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".promo-bar"), "Promo bar")

@test("SM-16 | Секция каталога видна", "🔥 SMOKE: Секции")
def test_catalog_section(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".catalog"), "Секция каталога")

@test("SM-17 | Инструмент подбора арматуры виден", "🔥 SMOKE: Секции")
def test_selector_section(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".selector"), "Selector")

@test("SM-18 | Секция 'Почему выбирают нас' видна", "🔥 SMOKE: Секции")
def test_why_section(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".why"), "Секция why")

@test("SM-19 | Секция 'Объекты' видна", "🔥 SMOKE: Секции")
def test_projects_section(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".projects"), "Секция projects")

@test("SM-20 | Секция 'Отзывы' видна", "🔥 SMOKE: Секции")
def test_testi_section(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".testi"), "Секция testi")

@test("SM-21 | PDF-баннер виден", "🔥 SMOKE: Секции")
def test_pdf_section(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".pdf-banner"), "PDF banner")

@test("SM-22 | Блог-секция видна", "🔥 SMOKE: Секции")
def test_blog_section(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".blog"), "Секция blog")

@test("SM-23 | Секция доставки видна", "🔥 SMOKE: Секции")
def test_delivery_section(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".delivery"), "Секция delivery")

@test("SM-24 | Контактная секция видна", "🔥 SMOKE: Секции")
def test_contact_section(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".contact"), "Секция contact")

@test("SM-25 | Футер виден", "🔥 SMOKE: Секции")
def test_footer(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".footer"), "Footer")

@test("SM-26 | Плавающая кнопка WhatsApp видна", "🔥 SMOKE: Секции")
def test_wa_float(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".wa-float"), "WhatsApp float")

@test("SM-27 | Модальное окно изначально скрыто", "🔥 SMOKE: Секции")
def test_modal_hidden(page: Page):
    page.goto(FILE_URL)
    modal = page.locator("#modal")
    classes = modal.get_attribute("class") or ""
    expect_true("open" not in classes, "Модальное окно открыто по умолчанию!")

@test("SM-28 | Marquee-бегущая строка видна", "🔥 SMOKE: Секции")
def test_marquee(page: Page):
    page.goto(FILE_URL)
    expect_visible(page.locator(".marquee"), "Marquee")

@test("SM-29 | Stats bar содержит 5 блоков", "🔥 SMOKE: Секции")
def test_stats_count(page: Page):
    page.goto(FILE_URL)
    expect_count(page.locator(".stat-box"), 5)

@test("SM-30 | Мобильный вид: hero видна (390px)", "🔥 SMOKE: Mobile")
def test_mobile_hero(page: Page):
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(FILE_URL)
    expect_visible(page.locator(".hero"), "Hero на мобильном")

# ═══════════════════════════════════════════════════════════════
#   🧩 FUNCTIONAL TESTS
# ═══════════════════════════════════════════════════════════════

@test("FN-01 | RU активен по умолчанию", "🌐 FUNC: i18n")
def test_default_lang(page: Page):
    page.goto(FILE_URL)
    active = page.locator("#langBox span.active")
    expect_true(active.count() == 1, "Нет активного языка")
    expect_contains(active.text_content(), "RU")

@test("FN-02 | Переключение на казахский ҚЗ", "🌐 FUNC: i18n")
def test_switch_kz(page: Page):
    page.goto(FILE_URL)
    page.click("#langBox span:has-text('ҚЗ')")
    active = page.locator("#langBox span.active")
    expect_contains(active.text_content(), "ҚЗ")

@test("FN-03 | Текст hero меняется при переключении на ҚЗ", "🌐 FUNC: i18n")
def test_kz_hero_text(page: Page):
    page.goto(FILE_URL)
    ru_text = page.locator(".hero-h1").text_content()
    page.click("#langBox span:has-text('ҚЗ')")
    kz_text = page.locator(".hero-h1").text_content()
    expect_true(ru_text != kz_text, "Текст не изменился при переключении языка")

@test("FN-04 | Переключение на EN", "🌐 FUNC: i18n")
def test_switch_en(page: Page):
    page.goto(FILE_URL)
    page.click("#langBox span:has-text('EN')")
    active = page.locator("#langBox span.active")
    expect_contains(active.text_content(), "EN")

@test("FN-05 | Текст hero на EN содержит 'VALVE'", "🌐 FUNC: i18n")
def test_en_hero_text(page: Page):
    page.goto(FILE_URL)
    page.click("#langBox span:has-text('EN')")
    h1_text = page.locator(".hero-h1").text_content().upper()
    expect_contains(h1_text, "VALVE")

@test("FN-06 | Кнопка КП переводится на EN → 'QUOTE'", "🌐 FUNC: i18n")
def test_en_cta(page: Page):
    page.goto(FILE_URL)
    page.click("#langBox span:has-text('EN')")
    cta = page.locator(".nav-cta").text_content()
    expect_contains(cta.upper(), "QUOTE")

@test("FN-07 | Цикл RU→KZ→EN→RU не ломает страницу", "🌐 FUNC: i18n")
def test_lang_cycle(page: Page):
    page.goto(FILE_URL)
    for lang in ["ҚЗ", "EN", "RU"]:
        page.click(f"#langBox span:has-text('{lang}')")
        expect_visible(page.locator(".hero"), f"Hero не видна после переключения на {lang}")

@test("FN-08 | lang атрибут html меняется при EN", "🌐 FUNC: i18n")
def test_html_lang_en(page: Page):
    page.goto(FILE_URL)
    page.click("#langBox span:has-text('EN')")
    lang = page.locator("html").get_attribute("lang")
    expect_true(lang == "en", f"html lang = {lang}, ожидается 'en'")

@test("FN-09 | 6 карточек продукта в каталоге", "📦 FUNC: Каталог")
def test_catalog_cards(page: Page):
    page.goto(FILE_URL)
    expect_count(page.locator(".cat-grid .cat-card"), 6)

@test("FN-10 | Каждая карточка имеет номер, DN-спецификацию", "📦 FUNC: Каталог")
def test_card_contents(page: Page):
    page.goto(FILE_URL)
    cards = page.locator(".cat-card")
    for i in range(cards.count()):
        card = cards.nth(i)
        num  = card.locator(".cat-num").text_content()
        spec = card.locator(".cat-spec").text_content()
        expect_true(len(num.strip()) > 0, f"Карточка {i}: нет номера")
        expect_contains(spec, "DN", f"Карточка {i}: нет DN в спецификации")

@test("FN-11 | 5 фильтров в каталоге", "📦 FUNC: Каталог")
def test_filter_count(page: Page):
    page.goto(FILE_URL)
    expect_count(page.locator(".filter-btn"), 5)

@test("FN-12 | Первый фильтр активен по умолчанию", "📦 FUNC: Каталог")
def test_first_filter_active(page: Page):
    page.goto(FILE_URL)
    first = page.locator(".filter-btn").nth(0)
    expect_has_class(first, "active", "Первый фильтр")

@test("FN-13 | Клик по фильтру переключает активность", "📦 FUNC: Каталог")
def test_filter_click(page: Page):
    page.goto(FILE_URL)
    page.locator(".filter-btn").nth(2).click()
    active = page.locator(".filter-btn.active")
    expect_count(active, 1)

@test("FN-14 | До выбора среды результат подбора скрыт", "⚙️ FUNC: Подборщик")
def test_selector_hidden(page: Page):
    page.goto(FILE_URL)
    result = page.locator("#toolResult")
    classes = result.get_attribute("class") or ""
    expect_true("show" not in classes, "Результат виден до выбора среды")

@test("FN-15 | Выбор 'Вода' показывает рекомендацию", "⚙️ FUNC: Подборщик")
def test_selector_water(page: Page):
    page.goto(FILE_URL)
    page.select_option("#medium", "water")
    result = page.locator("#toolResult")
    expect_has_class(result, "show", "Результат")

@test("FN-16 | Рекомендации для воды и нефти различаются", "⚙️ FUNC: Подборщик")
def test_selector_diff(page: Page):
    page.goto(FILE_URL)
    page.select_option("#medium", "water")
    text_water = page.locator("#toolResultText").text_content()
    page.select_option("#medium", "oil")
    text_oil   = page.locator("#toolResultText").text_content()
    expect_true(text_water != text_oil, "Рекомендации одинаковы для разных сред")

@test("FN-17 | Выбор PN25 добавляется в результат", "⚙️ FUNC: Подборщик")
def test_selector_pn(page: Page):
    page.goto(FILE_URL)
    page.select_option("#medium", "oil")
    page.select_option("#pn", "PN25")
    text = page.locator("#toolResultText").text_content()
    expect_contains(text, "PN25")

@test("FN-18 | Кнопка 'ОПРОСНЫЙ ЛИСТ' открывает модальное", "⚙️ FUNC: Подборщик")
def test_selector_modal(page: Page):
    page.goto(FILE_URL)
    page.locator(".selector .btn-tool").click()
    modal = page.locator("#modal")
    expect_has_class(modal, "open", "Модальное окно")

@test("FN-19 | Модальное открывается по nav-cta", "📋 FUNC: Модальное")
def test_modal_open_nav(page: Page):
    page.goto(FILE_URL)
    page.locator(".nav-cta").click()
    expect_has_class(page.locator("#modal"), "open", "Модальное")

@test("FN-20 | Модальное закрывается по кнопке ×", "📋 FUNC: Модальное")
def test_modal_close_x(page: Page):
    page.goto(FILE_URL)
    page.locator(".nav-cta").click()
    page.locator(".modal-x").click()
    classes = page.locator("#modal").get_attribute("class") or ""
    expect_true("open" not in classes, "Модальное не закрылось")

@test("FN-21 | Модальное содержит заголовок 'ОПРОСНЫЙ'", "📋 FUNC: Модальное")
def test_modal_title(page: Page):
    page.goto(FILE_URL)
    page.locator(".nav-cta").click()
    title = page.locator(".modal-title").text_content()
    expect_contains(title.upper(), "ОПРОСНЫЙ")

@test("FN-22 | В поле имени можно вводить текст", "📋 FUNC: Модальное")
def test_modal_input(page: Page):
    page.goto(FILE_URL)
    page.locator(".nav-cta").click()
    inp = page.locator(".modal input[type='text']").nth(0)
    inp.fill("Асет Жаксыбеков")
    val = inp.input_value()
    expect_true(val == "Асет Жаксыбеков", f"Имя не введено (got: {val})")

@test("FN-23 | Модальное открывается из PDF-баннера", "📋 FUNC: Модальное")
def test_modal_from_pdf(page: Page):
    page.goto(FILE_URL)
    page.locator(".btn-pdf-outline").click()
    expect_has_class(page.locator("#modal"), "open", "Модальное из PDF")

@test("FN-24 | 6 объектов в секции проектов", "🗺️ FUNC: Контент")
def test_projects_count(page: Page):
    page.goto(FILE_URL)
    expect_count(page.locator(".proj-card"), 6)

@test("FN-25 | Каждый проект имеет город и название", "🗺️ FUNC: Контент")
def test_projects_content(page: Page):
    page.goto(FILE_URL)
    cards = page.locator(".proj-card")
    for i in range(cards.count()):
        card = cards.nth(i)
        city = card.locator(".proj-city").text_content()
        name = card.locator(".proj-name").text_content()
        expect_true(len(city.strip()) > 3, f"Проект {i}: нет города")
        expect_true(len(name.strip()) > 3, f"Проект {i}: нет названия")

@test("FN-26 | 3 отзыва клиентов", "🗺️ FUNC: Контент")
def test_testimonials_count(page: Page):
    page.goto(FILE_URL)
    expect_count(page.locator(".testi-card"), 3)

@test("FN-27 | 3 статьи в блоге", "🗺️ FUNC: Контент")
def test_blog_count(page: Page):
    page.goto(FILE_URL)
    expect_count(page.locator(".art-card"), 3)

@test("FN-28 | 6 городов доставки", "🗺️ FUNC: Контент")
def test_delivery_cities(page: Page):
    page.goto(FILE_URL)
    expect_count(page.locator(".city-item"), 6)

@test("FN-29 | WhatsApp ссылка содержит номер 77078555511", "📞 FUNC: Контакты")
def test_wa_link(page: Page):
    page.goto(FILE_URL)
    href = page.locator(".wa-float").get_attribute("href")
    expect_contains(href, "77078555511")

@test("FN-30 | Мегаменю появляется при hover на Каталог", "🧭 FUNC: Навигация")
def test_megamenu(page: Page):
    page.goto(FILE_URL)
    page.locator(".nav-links > li > a").nth(0).hover()
    page.wait_for_timeout(200)
    mega = page.locator(".megamenu").nth(0)
    expect_visible(mega, "Мегаменю")

@test("FN-31 | Мегаменю содержит 6 продуктов", "🧭 FUNC: Навигация")
def test_megamenu_items(page: Page):
    page.goto(FILE_URL)
    page.locator(".nav-links > li > a").nth(0).hover()
    expect_count(page.locator(".megamenu .mega-item"), 6)

@test("FN-32 | Страница загружается менее чем за 5 сек", "⚡ FUNC: Производительность")
def test_performance(page: Page):
    start = time.time()
    page.goto(FILE_URL, wait_until="load")
    duration = time.time() - start
    expect_true(duration < 5.0, f"Загрузка заняла {duration:.2f}s (лимит 5s)")

@test("FN-33 | DOM готов менее чем за 2 секунды", "⚡ FUNC: Производительность")
def test_dom_ready(page: Page):
    start = time.time()
    page.goto(FILE_URL, wait_until="domcontentloaded")
    duration = time.time() - start
    expect_true(duration < 2.0, f"DOMContentLoaded: {duration:.2f}s (лимит 2s)")

@test("FN-34 | H1 имеет ненулевую высоту (шрифты загружены)", "⚡ FUNC: Производительность")
def test_font_loaded(page: Page):
    page.goto(FILE_URL, wait_until="load")
    height = page.locator(".hero-h1").bounding_box()["height"]
    expect_true(height > 0, f"H1 высота: {height}px")

@test("FN-35 | Секции видны после скролла вниз", "⚡ FUNC: Производительность")
def test_scroll_sections(page: Page):
    page.goto(FILE_URL)
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(300)
    expect_visible(page.locator(".footer"), "Footer после скролла")

# ═══════════════════════════════════════════════════════════════
#   🚀 RUNNER
# ═══════════════════════════════════════════════════════════════

def run_all_tests():
    print(f"\n{BOLD}╔══════════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BOLD}║   ASTANA VALVE — PLAYWRIGHT TEST SUITE                       ║{RESET}")
    print(f"{BOLD}║   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  ·  {len(all_tests)} тестов                       ║{RESET}")
    print(f"{BOLD}╚══════════════════════════════════════════════════════════════╝{RESET}\n")

    passed  = []
    failed  = []
    current_suite = None

    with sync_playwright() as p:
        browser: Browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            locale="ru-RU"
        )

        for t in all_tests:
            suite = t["suite"]
            if suite != current_suite:
                current_suite = suite
                print(f"\n  {BOLD}{BLUE}{suite}{RESET}")

            page = context.new_page()
            start = time.time()
            try:
                t["fn"](page)
                dur = time.time() - start
                passed.append(t["name"])
                print(f"  {GREEN}✅ PASS{RESET}  {t['name']}  {YELLOW}({dur*1000:.0f}ms){RESET}")
                test_results.append({"test": t["name"], "suite": suite, "status": "PASS", "duration_ms": round(dur*1000)})
            except Exception as e:
                dur = time.time() - start
                failed.append((t["name"], str(e)))
                print(f"  {RED}❌ FAIL{RESET}  {t['name']}")
                print(f"         {RED}→ {str(e)[:120]}{RESET}")
                test_results.append({"test": t["name"], "suite": suite, "status": "FAIL", "error": str(e), "duration_ms": round(dur*1000)})
            finally:
                page.close()

        context.close()
        browser.close()

    # ─── SUMMARY ──────────────────────────────────────────────
    total = len(all_tests)
    pct   = round(len(passed) / total * 100)

    print(f"\n{BOLD}{'═'*65}{RESET}")
    print(f"\n{BOLD}📊 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ{RESET}")
    print(f"  ✅ Пройдено:  {GREEN}{BOLD}{len(passed)}{RESET}")
    print(f"  ❌ Не прошли: {RED}{BOLD}{len(failed)}{RESET}")
    print(f"  📈 Покрытие:  {BOLD}{pct}%{RESET}  ({total} тестов)")

    if failed:
        print(f"\n{BOLD}{RED}Провалившиеся тесты:{RESET}")
        for name, err in failed:
            print(f"  • {name}: {err[:100]}")

    # ─── JSON REPORT ───────────────────────────────────────────
    report = {
        "project": "Astana Valve Website",
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total": total,
            "passed": len(passed),
            "failed": len(failed),
            "pass_rate_pct": pct
        },
        "tests": test_results
    }
    report_path = RESULTS_DIR / "playwright_results.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\n  📄 JSON отчёт: {report_path}")

    if failed:
        print(f"\n{RED}{BOLD}❌ Некоторые тесты не прошли.{RESET}")
        sys.exit(1)
    else:
        print(f"\n{GREEN}{BOLD}🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!{RESET}\n")
        sys.exit(0)

if __name__ == "__main__":
    run_all_tests()
