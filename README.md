# Товарная линейка · Конструктор

Веб-сервис для построения годовой товарной линейки. Та же механика и формулы что в xlsx-шаблоне «ТОВАРНАЯ ЛИНЕЙКА», но с удобной визуальной подачей.

## Что внутри

**6 шагов методологии (из xlsx, все формулы и связи 1:1):**

1. **🎯 Цели** — личные + компании + затраты → «итого необходимо за год»
2. **🗓 Календарь** — выходные / отпуска / события / продажи
3. **📣 Аудитория и продукты** — 5 групп запросов → 6 продуктов
4. **💰 Расчёт стоимости** — затраты + экспертиза + %прибыли → 9 тарифов
5. **✨ Сборка линейки** — визуальный трубопровод + финальная декомпозиция с попаданием в цель
6. **✅ План** — задачи по месяцам + ежедневная аналитика + воронка конверсии

**Фишки:**
- Тултипы ℹ️ с инструкциями прямо у каждого поля (вытащены из листов xlsx)
- Визуальный трубопровод продуктов (как в ContentMap, только про продукты)
- Автосохранение в браузере (localStorage)
- 3 темы: светлая / тёмная / лиловая
- Экспорт JSON (для обмена с подругой) и Excel (в исходной структуре)
- Мобильный UX (iOS-стиль карточек + bottom sheets)

## Быстрый старт

```bash
cd C:/Users/polin/product-line
npm run dev
```

Откроется на http://localhost:3000.

## Деплой на Vercel (публичный URL)

1. Залей эту папку на GitHub (см. ниже)
2. Зайди на https://vercel.com → **New Project** → **Import Git Repository**
3. Выбери `polishakarimova/product-line`
4. Нажми **Deploy** — через 2 минуты будет живой URL типа `product-line-polinas.vercel.app`

## Git + GitHub

```bash
cd C:/Users/polin/product-line
git init
git add .
git commit -m "initial commit: product-line constructor"
git branch -M main
# создать репо на github.com/new (private или public)
git remote add origin https://github.com/polishakarimova/product-line.git
git push -u origin main
```

## Работа вдвоём с подругой

Пока без real-time (Supabase можно добавить позже):
1. Заполняешь у себя
2. Меню справа вверху → **Экспорт → Скачать JSON**
3. Отправляешь подруге в Телеграм
4. Она нажимает **Импорт из JSON** → все данные загружаются на её устройстве

Так туда-сюда. Финальная версия — у того, у кого свежий JSON.

## Стек
- Next.js 16 · React 19 · TypeScript
- Tailwind CSS 4
- Zustand + persist (localStorage)
- XLSX для экспорта в Excel

## Структура

```
app/                 — 12 страниц
  page.tsx           — 🏠 Обзор с прогрессом и главными цифрами
  step-1/goals       — Цели и потребности
  step-1/monthly     — Декомпозиция по месяцам
  step-1/sales       — Декомпозиция в продажи
  step-2             — Календарь
  step-3/audience    — Запросы аудитории
  step-3/products    — Продукты
  step-4             — Расчёт стоимости
  step-5             — Сборка линейки
  step-6/tasks       — План задач
  step-6/analytics   — Ежедневная аналитика
  step-6/conversion  — Воронка
components/
  Stepper, SubTabs, InfoHint, MoneyInput, Sheet, ThemePill,
  ProgressRing, ExportMenu
lib/
  formulas.ts        — pure-функции для всех формул xlsx (154)
  types.ts           — TypeScript типы
  defaults.ts        — дефолты (месяцы, тарифы, статьи затрат)
  instructions.ts    — тексты инструкций из xlsx для тултипов
  store.ts           — Zustand store + persist
  exporter.ts        — экспорт в JSON и xlsx
  steps.ts           — структура 6 шагов
```
