'use client';

import { useStore } from '@/lib/store';
import { SubTabs } from '@/components/SubTabs';
import { MoneyInput } from '@/components/MoneyInput';
import { STEPS } from '@/lib/steps';
import { STEP_INTROS } from '@/lib/instructions';
import { fmtMoney } from '@/lib/formulas';

export default function AnalyticsPage() {
  const analytics = useStore(s => s.analytics);
  const setAnalytics = useStore(s => s.setAnalytics);
  const intro = STEP_INTROS['step-6/analytics'];
  const subtabs = STEPS.find(s => s.id === 'step-6')!.children!;

  const totalSales = analytics.daily.reduce((a, d) => a + d.sales, 0);
  const totalRevenue = analytics.daily.reduce((a, d) => a + d.revenue, 0);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>
      <SubTabs items={subtabs} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="stat-card-glass">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Всего продаж</div>
          <div className="tabular" style={{ fontSize: 22, fontWeight: 800 }}>{totalSales}</div>
        </div>
        <div className="stat-card-glass">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Всего оборот</div>
          <div className="tabular" style={{ fontSize: 22, fontWeight: 800 }}>{fmtMoney(totalRevenue)}</div>
        </div>
        <div className="stat-card-glass">
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Средний чек</div>
          <div className="tabular" style={{ fontSize: 22, fontWeight: 800 }}>{fmtMoney(totalSales > 0 ? totalRevenue / totalSales : 0)}</div>
        </div>
      </div>

      <div className="list-group" style={{ marginBottom: 16, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1.5fr 100px 140px 1.5fr 60px', gap: 8, padding: '10px 16px', background: 'var(--bg-inset)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: 0.3, minWidth: 820 }}>
          <span>Дата</span><span>Продукт</span><span>Продажи</span><span>Оборот</span><span>Комментарий</span><span></span>
        </div>
        {analytics.daily.map((d) => (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '140px 1.5fr 100px 140px 1.5fr 60px', gap: 8, padding: '10px 16px', borderBottom: '0.5px solid var(--border-soft)', alignItems: 'center', minWidth: 820 }}>
            <input type="date" className="input-field" value={d.date} onChange={e => setAnalytics(a => ({ ...a, daily: a.daily.map(x => x.id === d.id ? { ...x, date: e.target.value } : x) }))} />
            <input className="input-field" placeholder="Продукт" value={d.productName} onChange={e => setAnalytics(a => ({ ...a, daily: a.daily.map(x => x.id === d.id ? { ...x, productName: e.target.value } : x) }))} />
            <MoneyInput value={d.sales} onChange={v => setAnalytics(a => ({ ...a, daily: a.daily.map(x => x.id === d.id ? { ...x, sales: v } : x) }))} />
            <MoneyInput value={d.revenue} onChange={v => setAnalytics(a => ({ ...a, daily: a.daily.map(x => x.id === d.id ? { ...x, revenue: v } : x) }))} />
            <input className="input-field" placeholder="Заметка" value={d.comment} onChange={e => setAnalytics(a => ({ ...a, daily: a.daily.map(x => x.id === d.id ? { ...x, comment: e.target.value } : x) }))} />
            <button className="btn-icon" onClick={() => setAnalytics(a => ({ ...a, daily: a.daily.filter(x => x.id !== d.id) }))} aria-label="Удалить">✕</button>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={() => setAnalytics(a => ({ ...a, daily: [...a.daily, { id: Math.random().toString(36).slice(2, 9), date: new Date().toISOString().slice(0, 10), productName: '', sales: 0, revenue: 0, comment: '' }] }))}>
        + Добавить запись
      </button>
    </div>
  );
}
