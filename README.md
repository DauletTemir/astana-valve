# Astana Valve — Website

Сайт ТОО «Astana Valve» — казахстанский производитель промышленной запорной арматуры.

**Сайт:** astanavalve.kz · **Телефон:** +7 707 855-55-11 · **Email:** astanavalve@mail.ru

---

## Структура

```
astana-valve-project/
├── index.html              ← весь сайт (HTML + CSS + JS)
├── sitemap.xml
├── robots.txt
├── img/
│   ├── products/           ← фото продукции (JPG/PNG + WebP)
│   ├── company/            ← фото производства и сертификат
│   ├── products-cat/       ← PDF каталоги (21 файл)
│   └── kazakhstan-map-starred.jpg
├── docs/
│   ├── marketing-strategy.html
│   └── instagram-strategy.pptx
├── tests/
│   ├── smoke/smoke.test.ts
│   ├── functional/functional.test.ts
│   └── utils/html-validator.js
├── playwright.config.ts
└── package.json
```

---

## Запуск

```bash
npm install
npm run serve        # http://localhost:3000
npm test             # все тесты
npm run test:smoke   # только smoke
npm run lint:html    # статическая проверка HTML
```

---

## Технологии

- Одностраничный сайт — чистый HTML/CSS/JS, без фреймворков
- 3 языка: RU / ҚЗ / EN — без перезагрузки страницы
- PDF-каталог: 21 документ + ZIP-архив для скачивания
- Изображения: WebP с JPG/PNG fallback через `<picture>`
- Тесты: Playwright (TypeScript)
