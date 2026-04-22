import type { ProductLineState, Product, ProductPricing } from './types';

export const MONTH_NAMES_RU = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
];

export function getMonthsFromStart(startMonth: number): string[] {
  return Array.from({ length: 12 }, (_, i) => MONTH_NAMES_RU[(startMonth + i) % 12]);
}

export const DEFAULT_PERSONAL_EXPENSES = [
  'Квартира / ипотека',
  'Еда и продукты',
  'Транспорт',
  'Связь и интернет',
  'Развлечения и отдых',
  'Здоровье и красота',
  'Одежда',
  'Образование',
  'Подарки близким',
  'Подушка безопасности',
];

export const DEFAULT_COMPANY_EXPENSES = [
  'Команда (ЗП)',
  'Подписки на сервисы',
  'Реклама и продвижение',
  'Налоги',
  'Содержание (аренда, связь)',
  'Обучение команды',
  'Бухгалтерия',
  'Непредвиденные',
  'Продакшн контента',
  'Хостинг и инфра',
];

export const DEFAULT_CREATION_COSTS = [
  'Монтаж уроков',
  'Съёмки, включая подготовку',
  'Вёрстка материалов',
  'Дизайн и графика',
  'Копирайтинг',
];

export const DEFAULT_DELIVERY_COSTS = [
  'Технический специалист',
  'Куратор для проверки работ',
  'Администратор',
  'Платформа для обучения',
  'Дополнительные материалы',
];

export const SALES_CHANNELS_OPEN = ['Прямые эфиры', 'Вебинары', 'Мастер-классы', 'Открытые встречи'];
export const SALES_CHANNELS_CLOSED = ['Email-рассылка', 'Telegram', 'Личные сообщения', 'Промокоды'];

export const PRODUCT_FORMATS = ['Курс', 'Интенсив', 'Марафон', 'Мастер-класс', 'Консультация', 'Сопровождение', 'Мастермайнд', 'Клуб', 'Гайд / PDF', 'Вебинар'];

export const LINEUP_STRUCTURES = [
  'Лестница (лид-магнит → трипваер → основной → премиум)',
  'Воронка (входной → основной → апсейл)',
  'Матрица (несколько потоков для разных сегментов)',
  'Серия (один продукт в разных форматах)',
  'Экосистема (клуб + курсы + сопровождение)',
];

const genId = () => Math.random().toString(36).slice(2, 10);

export function createDefaultProduct(idx: number): Product {
  return {
    id: genId(),
    name: `Продукт ${idx + 1}`,
    format: '',
    requestKind: 'key',
    result: '',
    extraValue: '',
    content: [],
    theme: '',
    commonKeyRequests: '',
    commonSupportingRequests: '',
  };
}

export function createDefaultPricing(productId: string): ProductPricing {
  const defaultStage = () => ({ min: 0, base: 0, max: 0 });
  return {
    productId,
    creationCosts: DEFAULT_CREATION_COSTS.map((name, i) => ({ id: `c${i}`, name, amount: 0 })),
    deliveryCosts: DEFAULT_DELIVERY_COSTS.map((name, i) => ({ id: `d${i}`, name, amount: 0 })),
    optimalParticipants: 1,
    expertHourRate: 0,
    expertHours: 0,
    profitPercent: 0,
    firstRight: defaultStage(),
    standard: defaultStage(),
    finalChance: defaultStage(),
  };
}

export function createInitialState(): ProductLineState {
  const defaultProducts: Product[] = Array.from({ length: 6 }, (_, i) => createDefaultProduct(i));
  const defaultPricing: ProductPricing[] = defaultProducts.map(p => createDefaultPricing(p.id));
  const monthNames = getMonthsFromStart(6);
  return {
    workspaceName: 'Моя товарная линейка',
    theme: 'light',
    startMonth: 6,
    calendarYear: new Date().getFullYear(),
    goals: {
      approach: 'both',
      personalGoals: [],
      companyGoals: [],
      personalExpenses: DEFAULT_PERSONAL_EXPENSES.map((name, i) => ({ id: `pe${i}`, name, amount: 0 })),
      companyExpenses: DEFAULT_COMPANY_EXPENSES.map((name, i) => ({ id: `ce${i}`, name, amount: 0 })),
      conclusion: '',
    },
    monthly: monthNames.map(m => ({
      month: m,
      personalGoalsValues: [0,0,0,0,0],
      companyGoalsValues: [0,0,0,0,0],
      reserve: 0,
    })),
    sales: {
      audience: { reach: 0, percent: 0 },
      months: monthNames.map(m => ({ month: m, salesCount: 0, avgCheck: 0 })),
    },
    calendar: { days: [], vacations: [], events: [], trainings: [] },
    audience: Array.from({ length: 5 }, (_, i) => ({
      id: `ag${i}`,
      summary: '',
      quotes: [],
    })),
    products: {
      products: defaultProducts,
      lineupStructure: '',
      lineupStructureReason: '',
    },
    pricing: defaultPricing,
    assembly: {
      assembly: defaultProducts.map((p, i) => ({
        productId: p.id,
        position: i,
        functionInLineup: '',
        salesChannelsOpen: '',
        salesChannelsClosed: '',
        warmupDays: 0,
        sellingDaysOpen: 0,
        sellingDaysClosed: 0,
        developmentDays: 0,
        deliveryDays: 0,
        deliveryDates: '',
      })),
      finalDecomposition: monthNames.map(m => ({
        month: m,
        targetRevenue: 0,
        firstRight: { minPrice: 0, minQty: 0, basePrice: 0, baseQty: 0, maxPrice: 0, maxQty: 0 },
        standard: { minPrice: 0, minQty: 0, basePrice: 0, baseQty: 0, maxPrice: 0, maxQty: 0 },
        finalChance: { minPrice: 0, minQty: 0, basePrice: 0, baseQty: 0, maxPrice: 0, maxQty: 0 },
      })),
    },
    tasks: {
      months: monthNames.map(m => ({ month: m, keyTask: '', keyTaskAssignee: '', subtasks: [] })),
      crisis: Array.from({ length: 5 }, (_, i) => ({ id: `cr${i}`, situation: '', response: '' })),
    },
    analytics: { daily: [], funnel: [] },
  };
}
