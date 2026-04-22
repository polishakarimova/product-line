'use client';

import { useStore } from '@/lib/store';
import { monthlyTotals, fmtMoney } from '@/lib/formulas';
import { InfoHint } from '@/components/InfoHint';
import { MoneyInput } from '@/components/MoneyInput';
import { SubTabs } from '@/components/SubTabs';
import { STEPS } from '@/lib/steps';
import { INSTRUCTIONS, STEP_INTROS } from '@/lib/instructions';
import { MONTH_NAMES_RU } from '@/lib/defaults';

export default function MonthlyPage() {
  const state = useStore();
  const goals = state.goals;
  const monthly = state.monthly;
  const setMonthly = state.setMonthly;
  const startMonth = state.startMonth;
  const setStartMonth = state.setStartMonth;
  const { rows, yearTotal } = monthlyTotals(monthly, goals);
  const intro = STEP_INTROS['step-1/monthly'];
  const subtabs = STEPS.find(s => s.id === 'step-1')!.children!;

  const personalGoalNames = goals.personalGoals.slice(0, 5);
  const companyGoalNames = goals.companyGoals.slice(0, 5);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>
      <SubTabs items={subtabs} />

      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <label className="input-label" style={{ marginBottom: 0 }}>
          Начать с месяца
          <InfoHint text={INSTRUCTIONS.monthStart} />
        </label>
        <select className="input-field" style={{ maxWidth: 200 }} value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))}>
          {MONTH_NAMES_RU.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      {/* Годовой итог */}
      <div className="stat-card-purple" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Годовой оборот</div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>{fmtMoney(yearTotal)}</div>
        </div>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
          {yearTotal > 0 ? `${Math.round(yearTotal / (goals.personalGoals.reduce((a, g) => a + g.amount, 0) + goals.companyGoals.reduce((a, g) => a + g.amount, 0) + (goals.personalExpenses.reduce((a, g) => a + g.amount, 0) + goals.companyExpenses.reduce((a, g) => a + g.amount, 0)) * 12 || 1) * 100)}% от цели` : 'Заполните цели'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12 }}>
        {rows.map((r, mIdx) => (
          <div key={r.month} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{r.month}</h3>
              <span className="badge badge-purple">{fmtMoney(r.totalForMonth)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-inset)', borderRadius: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Личная база</span>
                <span className="tabular">{fmtMoney(r.personalBase)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-inset)', borderRadius: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>База компании</span>
                <span className="tabular">{fmtMoney(r.companyBase)}</span>
              </div>
            </div>
            {personalGoalNames.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 10, marginBottom: 6 }}>Личные цели</div>
                {personalGoalNames.map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, flex: 1, color: 'var(--text-secondary)' }}>{g.name || `Цель ${i + 1}`}</span>
                    <div style={{ width: 120 }}>
                      <MoneyInput
                        value={monthly[mIdx]?.personalGoalsValues[i] || 0}
                        onChange={(v) => setMonthly(prev => prev.map((m, k) => k === mIdx ? { ...m, personalGoalsValues: m.personalGoalsValues.map((x, j) => j === i ? v : x) } : m))}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            {companyGoalNames.length > 0 && (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 10, marginBottom: 6 }}>Цели компании</div>
                {companyGoalNames.map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, flex: 1, color: 'var(--text-secondary)' }}>{g.name || `Цель ${i + 1}`}</span>
                    <div style={{ width: 120 }}>
                      <MoneyInput
                        value={monthly[mIdx]?.companyGoalsValues[i] || 0}
                        onChange={(v) => setMonthly(prev => prev.map((m, k) => k === mIdx ? { ...m, companyGoalsValues: m.companyGoalsValues.map((x, j) => j === i ? v : x) } : m))}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: 12, flex: 1, color: 'var(--text-secondary)', fontWeight: 600 }}>
                Резерв
                <InfoHint text={INSTRUCTIONS.reserve} />
              </span>
              <div style={{ width: 120 }}>
                <MoneyInput
                  value={monthly[mIdx]?.reserve || 0}
                  onChange={(v) => setMonthly(prev => prev.map((m, k) => k === mIdx ? { ...m, reserve: v } : m))}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
