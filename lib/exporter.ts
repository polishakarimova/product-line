'use client';

import * as XLSX from 'xlsx';
import type { ProductLineState } from './types';
import { goalsTotals, monthlyTotals, salesTotals, pricingTotals, finalDecompositionRowTotal, finalDecompositionYearTotal } from './formulas';

export function exportJSON(state: ProductLineState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.workspaceName || 'product-line'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportXLSX(state: ProductLineState) {
  const wb = XLSX.utils.book_new();
  const gt = goalsTotals(state.goals);

  // Sheet 1: Цели и потребности
  const s1: (string | number)[][] = [
    ['ТАБЛИЦА 1: РАСЧЁТ ФИНАНСОВЫХ ЦЕЛЕЙ И ПОТРЕБНОСТЕЙ'],
    [],
    ['Подход к планированию:', state.goals.approach],
    [],
    ['ЛИЧНЫЕ ЦЕЛИ НА ГОД', 'СТОИМОСТЬ', '', 'ЦЕЛИ КОМПАНИИ НА ГОД', 'СТОИМОСТЬ'],
    ...Array.from({ length: Math.max(state.goals.personalGoals.length, state.goals.companyGoals.length, 5) }, (_, i) => [
      state.goals.personalGoals[i]?.name || '',
      state.goals.personalGoals[i]?.amount ?? '',
      '',
      state.goals.companyGoals[i]?.name || '',
      state.goals.companyGoals[i]?.amount ?? '',
    ]),
    ['Итого личные:', gt.personalGoalsTotal, '', 'Оборот компании:', gt.companyGoalsTotal],
    ['Годовая сумма финансовых целей:', gt.annualGoalsTotal],
    [],
    ['ЕЖЕМЕСЯЧНЫЕ ЛИЧНЫЕ ЗАТРАТЫ', 'СУММА', '', 'ЕЖЕМЕСЯЧНЫЕ ЗАТРАТЫ КОМПАНИИ', 'СУММА'],
    ...Array.from({ length: 10 }, (_, i) => [
      state.goals.personalExpenses[i]?.name || '',
      state.goals.personalExpenses[i]?.amount ?? '',
      '',
      state.goals.companyExpenses[i]?.name || '',
      state.goals.companyExpenses[i]?.amount ?? '',
    ]),
    ['В месяц:', gt.personalMonthlyExpenses, '', 'В месяц:', gt.companyMonthlyExpenses],
    ['За год:', gt.personalAnnualExpenses, '', 'За год:', gt.companyAnnualExpenses],
    ['Годовые базовые потребности:', gt.annualBase],
    [],
    ['ИТОГО НЕОБХОДИМО:', gt.totalNeeded],
    [],
    ['Вывод:', state.goals.conclusion],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), '1.1 Цели');

  // Sheet 1.2: Декомпозиция по месяцам
  const mt = monthlyTotals(state.monthly, state.goals);
  const s2: (string | number)[][] = [
    ['ТАБЛИЦА 2: ДЕКОМПОЗИЦИЯ ПО МЕСЯЦАМ'],
    [],
    ['Месяц', 'Личные (база)', 'Компания (база)', 'Цели личные', 'Цели компании', 'Резерв', 'Итого за месяц'],
    ...mt.rows.map(r => [r.month, r.personalBase, r.companyBase, r.personalGoalsSum, r.companyGoalsSum, r.reserve, r.totalForMonth]),
    ['', '', '', '', '', 'Годовой оборот:', mt.yearTotal],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), '1.2 Месяцы');

  // Sheet 1.3: По продажам
  const st = salesTotals(state.sales, state.monthly, state.goals);
  const s3: (string | number)[][] = [
    ['ТАБЛИЦА 3: ДЕКОМПОЗИЦИЯ ПО ПРОДАЖАМ'],
    [],
    ['Охваты', 'Процент', 'Объём покупателей'],
    [state.sales.audience.reach, state.sales.audience.percent + '%', st.audienceVolume],
    [],
    ['Месяц', 'Цель', 'Количество продаж', 'Средний чек', 'Расчётное значение', 'Отклонение'],
    ...st.rows.map(r => [r.month, r.targetRevenue, r.salesCount, r.avgCheck, r.calculated, r.delta]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s3), '1.3 Продажи');

  // Sheet: Аудитория
  const s4: (string | number)[][] = [
    ['ТАБЛИЦА 5: ЗАПРОСЫ АУДИТОРИИ'],
    [],
  ];
  state.audience.forEach((g, i) => {
    s4.push([`ГРУППА ${i + 1}`, g.summary]);
    g.quotes.forEach(q => s4.push(['  ', q]));
    s4.push([]);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s4), '3.1 Аудитория');

  // Sheet: Продукты
  const s5: (string | number)[][] = [
    ['ТАБЛИЦА 6: ПРОДУКТЫ ДЛЯ ЛИНЕЙКИ'],
    [],
    ['Структура линейки:', state.products.lineupStructure],
    ['Почему:', state.products.lineupStructureReason],
    [],
    ['№', 'Название', 'Формат', 'Тип запроса', 'Результат', 'Доп. ценность', 'Содержание'],
    ...state.products.products.map((p, i) => [i + 1, p.name, p.format, p.requestKind === 'key' ? 'ключевой' : 'дополняющий', p.result, p.extraValue, p.content.join(', ')]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s5), '3.2 Продукты');

  // Sheet: Расчёт стоимости
  const s6: (string | number)[][] = [['ТАБЛИЦА 7: РАСЧЁТ СТОИМОСТИ'], []];
  state.pricing.forEach((p, idx) => {
    const prod = state.products.products.find(x => x.id === p.productId);
    const pt = pricingTotals(p);
    s6.push([`ПРОДУКТ ${idx + 1}: ${prod?.name || ''}`]);
    s6.push(['Затраты на создание:', pt.creationTotal]);
    s6.push(['Затраты на предоставление:', pt.deliveryTotal]);
    s6.push(['Мин. объём выручки:', pt.minRevenueToCoverCosts]);
    s6.push(['Оптимально участников:', p.optimalParticipants]);
    s6.push(['Мин. себестоимость на 1:', pt.minCostPerParticipant]);
    s6.push(['Стоимость экспертизы:', pt.expertCost]);
    s6.push(['На 1 участника:', pt.expertCostPerParticipant]);
    s6.push(['Процент прибыли:', p.profitPercent + '%']);
    s6.push(['Базовая стоимость на 1:', pt.basePricePerParticipant]);
    s6.push(['Средний чек:', pt.avgCheck]);
    s6.push([]);
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s6), '4. Стоимость');

  // Sheet: Финальная декомпозиция
  const s7: (string | number)[][] = [
    ['ТАБЛИЦА 8: ФИНАЛЬНАЯ ДЕКОМПОЗИЦИЯ ПО МЕСЯЦАМ'],
    [],
    ['Месяц', 'Цель', 'Продукт', 'Расчётное значение'],
    ...state.assembly.finalDecomposition.map(row => {
      const prod = state.products.products.find(p => p.id === row.productId);
      return [row.month, row.targetRevenue, prod?.name || '', finalDecompositionRowTotal(row)];
    }),
    ['', 'ИТОГО ЗА ГОД:', '', finalDecompositionYearTotal(state.assembly.finalDecomposition)],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s7), '5. Финальная');

  // Sheet: План задач
  const s8: (string | number)[][] = [
    ['ТАБЛИЦА 9: ПЛАН ЗАДАЧ ПО МЕСЯЦАМ'],
    [],
    ['Месяц', 'Ключевая задача', 'Кто выполняет', 'Подзадачи'],
    ...state.tasks.months.map(m => [m.month, m.keyTask, m.keyTaskAssignee, m.subtasks.map(s => `${s.task} (${s.assignee})`).join('; ')]),
    [],
    ['АНТИКРИЗИСНЫЕ МЕРЫ'],
    ['Ситуация', 'Что предприму'],
    ...state.tasks.crisis.map(c => [c.situation, c.response]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s8), '6.1 Задачи');

  XLSX.writeFile(wb, `${state.workspaceName || 'product-line'}.xlsx`);
}

export function importJSON(file: File): Promise<Partial<ProductLineState>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || '{}'));
        resolve(data);
      } catch (e) { reject(e); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
