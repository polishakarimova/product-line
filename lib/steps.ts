export type StepDef = {
  id: string;
  num: number;
  title: string;
  emoji: string;
  href: string;
  children?: { id: string; title: string; href: string }[];
};

export const STEPS: StepDef[] = [
  {
    id: 'step-1', num: 1, title: 'Цели', emoji: '🎯', href: '/step-1/goals',
    children: [
      { id: 'goals', title: 'Цели и потребности', href: '/step-1/goals' },
      { id: 'monthly', title: 'По месяцам', href: '/step-1/monthly' },
      { id: 'sales', title: 'В продажи', href: '/step-1/sales' },
    ],
  },
  { id: 'step-2', num: 2, title: 'Календарь', emoji: '🗓', href: '/step-2' },
  {
    id: 'step-3', num: 3, title: 'Аудитория и продукты', emoji: '📣', href: '/step-3/audience',
    children: [
      { id: 'audience', title: 'Запросы аудитории', href: '/step-3/audience' },
      { id: 'products', title: 'Продукты', href: '/step-3/products' },
    ],
  },
  { id: 'step-4', num: 4, title: 'Стоимость', emoji: '💰', href: '/step-4' },
  { id: 'step-5', num: 5, title: 'Сборка линейки', emoji: '✨', href: '/step-5' },
  {
    id: 'step-6', num: 6, title: 'План', emoji: '✅', href: '/step-6/tasks',
    children: [
      { id: 'tasks', title: 'Задачи по месяцам', href: '/step-6/tasks' },
      { id: 'analytics', title: 'Ежедневная аналитика', href: '/step-6/analytics' },
      { id: 'conversion', title: 'Конверсия', href: '/step-6/conversion' },
    ],
  },
];
