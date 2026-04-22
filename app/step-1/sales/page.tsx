'use client';

import { useStore } from '@/lib/store';
import { salesTotals, fmtMoney, fmtNum } from '@/lib/formulas';
import { InfoHint } from '@/components/InfoHint';
import { MoneyInput } from '@/components/MoneyInput';
import { SubTabs } from '@/components/SubTabs';
import { STEPS } from '@/lib/steps';
import { INSTRUCTIONS, STEP_INTROS } from '@/lib/instructions';

export default function SalesPage() {
  const state = useStore();
  const { audienceVolume, rows } = salesTotals(state.sales, state.monthly, state.goals);
  const intro = STEP_INTROS['step-1/sales'];
  const subtabs = STEPS.find(s => s.id === 'step-1')!.children!;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>
      <SubTabs items={subtabs} />

      {/* Блок 3.1 — объём покупателей */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>3.1 · Объём потенциальных покупателей</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <div>
            <label className="input-label">
              Охваты на целевой площадке
              <InfoHint text={INSTRUCTIONS.audienceReach} />
            </label>
            <MoneyInput value={state.sales.audience.reach} onChange={v => state.setSales(s => ({ ...s, audience: { ...s.audience, reach: v } }))} />
          </div>
          <div>
            <label className="input-label">
              % от охватов
              <InfoHint text={INSTRUCTIONS.audiencePercent} />
            </label>
            <input
              type="number"
              className="input-field input-money"
              value={state.sales.audience.percent || ''}
              placeholder="0"
              onChange={e => state.setSales(s => ({ ...s, audience: { ...s.audience, percent: Number(e.target.value) || 0 } }))}
            />
          </div>
          <div>
            <label className="input-label">
              Объём покупателей
              <InfoHint text={INSTRUCTIONS.audienceVolume} />
            </label>
            <div className="input-field input-money" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              {fmtNum(audienceVolume)}
            </div>
          </div>
        </div>
      </div>

      {/* 3.2 разбивка по месяцам */}
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>3.2 · Разбивка по месяцам</h3>
      <div className="list-group" style={{ marginBottom: 40 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 1fr 100px', padding: '10px 16px', background: 'var(--bg-inset)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: 0.3, gap: 8 }}>
          <span>Месяц</span><span>Оборот (цель)</span><span>Кол-во продаж</span><span>Средний чек</span><span>Расчётное</span><span style={{ textAlign: 'right' }}>Статус</span>
        </div>
        {rows.map((r, i) => (
          <div key={r.month} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr 1fr 1fr 100px', gap: 8, padding: '10px 16px', borderBottom: '0.5px solid var(--border-soft)', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{r.month}</span>
            <span className="tabular" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtMoney(r.targetRevenue)}</span>
            <MoneyInput value={r.salesCount} onChange={v => state.setSales(s => ({ ...s, months: s.months.map((m, k) => k === i ? { ...m, salesCount: v } : m) }))} />
            <MoneyInput value={r.avgCheck} onChange={v => state.setSales(s => ({ ...s, months: s.months.map((m, k) => k === i ? { ...m, avgCheck: v } : m) }))} />
            <span className="tabular" style={{ fontSize: 13, fontWeight: 700 }}>{fmtMoney(r.calculated)}</span>
            <span style={{ textAlign: 'right' }}>
              {r.targetRevenue === 0 && r.calculated === 0 ? <span className="badge badge-gray">—</span> :
                r.calculated >= r.targetRevenue ? <span className="badge badge-green">✓</span> :
                  <span className="badge badge-orange">{Math.round(r.calculated / r.targetRevenue * 100)}%</span>
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
