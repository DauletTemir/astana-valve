# 🏭 Astana Valve — Website Project

Полный проект сайта для ТОО «Astana Valve» — казахстанского производителя запорной арматуры.

---

## 📁 Структура проекта

```
astana-valve-project/
├── src/
│   ├── index.html          ← ✅ ФИНАЛЬНЫЙ САЙТ (Kinetic Force)
│   ├── design-v2.html      ← Альтернативный дизайн (Clean Precision)
│   └── mockups.html        ← 3 макета для сравнения
│
├── tests/
│   ├── smoke/
│   │   └── smoke.test.ts           ← Smoke-тесты (TypeScript/Playwright)
│   ├── functional/
│   │   └── functional.test.ts      ← Функциональные тесты (TS)
│   ├── utils/
│   │   └── html-validator.js       ← Статический HTML-валидатор (Node.js)
│   └── run_tests.py                ← ✅ ГЛАВНЫЙ ТЕСТ-РАННЕР (Python/Playwright)
│
├── test-results/
│   └── playwright_results.json     ← JSON-отчёт последнего запуска
│
├── docs/
│   ├── marketing-strategy.html     ← Маркетинговая стратегия
│   └── instagram-strategy.pptx    ← Instagram стратегия (PPTX)
│
├── playwright.config.ts    ← Конфиг Playwright (для Node.js запуска)
├── package.json
└── README.md
```

---

## 🚀 Быстрый старт

### Открыть сайт
```bash
# Просто откройте в браузере:
open src/index.html

# Или через локальный сервер:
npm install
npm run serve
```

### Запустить тесты

**Вариант 1: Python (рекомендуется — работает сразу)**
```bash
pip install playwright
playwright install chromium
python3 tests/run_tests.py
```

**Вариант 2: Node.js/Playwright (TypeScript)**
```bash
npm install
npx playwright install chromium
npm test                    # все тесты
npm run test:smoke          # только smoke
npm run test:functional     # только функциональные
npm run test:headed         # с открытым браузером (визуально)
npm run test:report         # HTML-отчёт
```

**Вариант 3: Статическая проверка (без браузера)**
```bash
node tests/utils/html-validator.js
```

---

## 🧪 Результаты тестирования

| Тип теста | Тестов | Результат |
|---|---|---|
| 🔥 Smoke (загрузка, секции) | 30 | ✅ 30/30 |
| 🌐 Functional i18n (RU/KZ/EN) | 8 | ✅ 8/8 |
| 📦 Functional каталог | 5 | ✅ 5/5 |
| ⚙️ Functional подборщик | 5 | ✅ 5/5 |
| 📋 Functional модальное | 5 | ✅ 5/5 |
| 🗺️ Functional контент | 5 | ✅ 5/5 |
| 📞 Functional контакты | 1 | ✅ 1/1 |
| 🧭 Functional навигация | 2 | ✅ 2/2 |
| ⚡ Производительность | 4 | ✅ 4/4 |
| **ИТОГО** | **65** | **✅ 65/65 (100%)** |

Отдельно: HTML Static Validator — **51/51 (100%)**

---

## 🌐 Мультиязычность

Сайт поддерживает 3 языка без перезагрузки страницы:

| Язык | Код | Переключатель |
|---|---|---|
| Русский | `ru` | Кнопка **RU** в навигации |
| Қазақша | `kk` | Кнопка **ҚЗ** в навигации |
| English | `en` | Кнопка **EN** в навигации |

---

## ✨ Ключевые функции сайта

- **Promo-бегущая строка** — акции и УТП
- **Мегаменю каталога** — 6 категорий продуктов
- **Подборщик арматуры** — интерактивный инструмент по среде/DN/PN
- **Опросный лист** — модальная форма B2B-запроса
- **6 реализованных объектов** — кейсы по регионам Казахстана
- **Отзывы клиентов** — социальное доказательство
- **PDF-каталог** — секция для скачивания
- **Блог/Справочник инженера** — 3 статьи
- **Карта доставки** — 6 городов Казахстана со сроками
- **Floating WhatsApp** — кнопка всегда доступна
- **Mobile-first** — адаптивный дизайн (390px+)

---

## 🎨 Дизайн-концепция

**Kinetic Force** — Bold Editorial стиль:
- Фон: `#f2ede6` (тёплый кремовый)
- Акцент: `#c8773a` (медно-оранжевый)
- Текст: `#1a1a1a` (почти чёрный)
- Шрифты: Bebas Neue (заголовки) + DM Sans (текст)
- Анимированный текстовый тикер в Hero
- Жирные границы (Neo-Brutalism элементы)

---

## 📞 Контакты Astana Valve

- **Телефон/WhatsApp:** +7 707 855-55-11
- **Email:** astanavalve@mail.ru
- **Адрес:** г. Астана, ул. Мустафина 7/1
- **Сайт:** astanavalve.kz
