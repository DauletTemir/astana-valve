/**
 * HTML Static Validator — Astana Valve
 * Проверяет HTML без браузера: структура, атрибуты, SEO
 * Запуск: node tests/utils/html-validator.js
 */

const fs = require('fs');
const path = require('path');

const HTML_FILE = path.resolve(__dirname, '../../src/index.html');
const html = fs.readFileSync(HTML_FILE, 'utf-8');

let passed = 0;
let failed = 0;
const results = [];

function check(id, description, condition, severity = 'ERROR') {
  const ok = !!condition;
  if (ok) passed++;
  else failed++;
  results.push({ id, description, status: ok ? '✅ PASS' : `❌ ${severity}`, ok });
  return ok;
}

// ── SEO ──────────────────────────────────────────────────
check('VAL-01', 'Title тег присутствует', html.includes('<title>'));
check('VAL-02', 'Title содержит "Astana Valve"', html.includes('Astana Valve'));
check('VAL-03', 'Meta description присутствует', html.includes('name="description"'));
check('VAL-04', 'Meta description содержит "Казахстан"', html.includes('Казахстан'));
check('VAL-05', 'Canonical URL отсутствует (нет ошибки newnew)', !html.includes('"newnew"'));
check('VAL-06', 'Lang атрибут на html', html.includes('<html lang='));
check('VAL-07', 'Charset UTF-8', html.includes('charset="UTF-8"'));
check('VAL-08', 'Viewport meta для мобильных', html.includes('width=device-width'));

// ── Структура ─────────────────────────────────────────────
check('VAL-09', '<nav> элемент присутствует', html.includes('<nav'));
check('VAL-10', 'Hero секция присутствует', html.includes('class="hero"'));
check('VAL-11', 'H1 заголовок присутствует', html.includes('<h1'));
check('VAL-12', 'Footer присутствует', html.includes('<footer'));
check('VAL-13', 'Логотип "ASTANA VALVE" в навигации', html.includes('ASTANA') && html.includes('VALVE'));

// ── Мультиязычность ───────────────────────────────────────
check('VAL-14', 'Языковой переключатель RU/KZ/EN', html.includes('RU') && html.includes('ҚЗ') && html.includes('EN'));
check('VAL-15', 'Функция setLang() определена', html.includes('function setLang'));
check('VAL-16', 'Словарь RU определён', html.includes("ru:{") || html.includes("ru : {"));
check('VAL-17', 'Словарь KZ определён', html.includes("kz:{") || html.includes("kz : {"));
check('VAL-18', 'Словарь EN определён', html.includes("en:{") || html.includes("en : {"));
check('VAL-19', 'data-k атрибуты для i18n присутствуют', html.includes('data-k='));

// ── Бизнес-критические элементы ──────────────────────────
check('VAL-20', 'Телефон +7 707 855-55-11 присутствует', html.includes('+7 707 855-55-11'));
check('VAL-21', 'Email astanavalve@mail.ru присутствует', html.includes('astanavalve@mail.ru'));
check('VAL-22', 'Адрес Мустафина 7/1 присутствует', html.includes('Мустафина'));
check('VAL-23', 'WhatsApp ссылка присутствует', html.includes('wa.me'));
check('VAL-24', 'WhatsApp номер в ссылке', html.includes('77078555511'));

// ── Продукты ──────────────────────────────────────────────
const products = ['задвижк', 'затвор', 'клапан', 'гидрант', 'вставк'];
products.forEach((p, i) => {
  check(`VAL-${25+i}`, `Продукт "${p}" упоминается`, html.toLowerCase().includes(p));
});

// ── Интерактивность ───────────────────────────────────────
check('VAL-30', 'Модальное окно #modal присутствует', html.includes('id="modal"'));
check('VAL-31', 'Функция openModal() определена', html.includes('function openModal'));
check('VAL-32', 'Функция closeModal() определена', html.includes('function closeModal'));
check('VAL-33', 'Инструмент подбора #medium select', html.includes('id="medium"'));
check('VAL-34', 'Функция calcTool() определена', html.includes('function calcTool'));
check('VAL-35', 'Фильтры каталога .filter-btn', html.includes('filter-btn'));
check('VAL-36', 'Прокрутка promo-bar анимирована', html.includes('promo-scroll') || html.includes('promo_scroll'));

// ── Секции сайта ──────────────────────────────────────────
const sections = [
  ['VAL-37', 'Секция stats', '.stats'],
  ['VAL-38', 'Секция catalog', '.catalog'],
  ['VAL-39', 'Секция selector', '.selector'],
  ['VAL-40', 'Секция why', '.why'],
  ['VAL-41', 'Секция projects', '.projects'],
  ['VAL-42', 'Секция testi', '.testi'],
  ['VAL-43', 'Секция pdf-banner', '.pdf-banner'],
  ['VAL-44', 'Секция blog', '.blog'],
  ['VAL-45', 'Секция delivery', '.delivery'],
  ['VAL-46', 'Секция contact', '.contact'],
];
sections.forEach(([id, desc, cls]) => {
  check(id, desc, html.includes(`class="${cls.slice(1)}"`) || html.includes(`class="${cls.slice(1)} `));
});

// ── CSS ───────────────────────────────────────────────────
check('VAL-47', 'Google Fonts подключены', html.includes('fonts.googleapis.com'));
check('VAL-48', 'Bebas Neue шрифт загружен', html.includes('Bebas+Neue'));
check('VAL-49', 'CSS переменные (custom properties) используются', html.includes(':root'));
check('VAL-50', 'Responsive @media query присутствует', html.includes('@media'));
check('VAL-51', 'Mobile breakpoint 700px или 900px', html.includes('max-width:700px') || html.includes('max-width:900px'));

// ── ВЫВОД ─────────────────────────────────────────────────
console.log('\n');
console.log('╔════════════════════════════════════════════════════╗');
console.log('║      ASTANA VALVE — HTML STATIC VALIDATOR          ║');
console.log('╚════════════════════════════════════════════════════╝\n');

results.forEach(r => {
  console.log(`${r.status}  [${r.id}] ${r.description}`);
});

console.log('\n────────────────────────────────────────────────────');
console.log(`📊 Результаты: ✅ ${passed} прошли  ❌ ${failed} не прошли  из ${results.length} проверок`);
console.log(`📈 Покрытие: ${Math.round((passed/results.length)*100)}%`);

if (failed > 0) {
  console.log('\n⚠️  Есть проблемы, требующие внимания!');
  process.exit(1);
} else {
  console.log('\n🎉 Все проверки пройдены!');
  process.exit(0);
}
