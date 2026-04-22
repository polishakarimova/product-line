'use client';

import { useStore } from '@/lib/store';
import { goalsTotals, fmtMoney } from '@/lib/formulas';
import { InfoHint } from '@/components/InfoHint';
import { MoneyInput } from '@/components/MoneyInput';
import { SubTabs } from '@/components/SubTabs';
import { INSTRUCTIONS, STEP_INTROS } from '@/lib/instructions';
import { STEPS } from '@/lib/steps';

export default function GoalsPage() {
  const goals = useStore(s => s.goals);
  const setGoals = useStore(s => s.setGoals);
  const addPersonalGoal = useStore(s => s.addPersonalGoal);
  const addCompanyGoal = useStore(s => s.addCompanyGoal);
  const t = goalsTotals(goals);
  const intro = STEP_INTROS['step-1/goals'];
  const subtabs = STEPS.find(s => s.id === 'step-1')!.children!;

  const approaches: { id: 'personal' | 'company' | 'both'; title: string; desc: string; emoji: string }[] = [
    { id: 'personal', title: 'Только личные', desc: 'Планирую жизнь — расходы, поездки, покупки', emoji: '🌸' },
    { id: 'both', title: 'И то и то', desc: 'Совмещаю личные цели и цели бизнеса', emoji: '✨' },
    { id: 'company', title: 'Только компания', desc: 'Планирую оборот и инвестиции бизнеса', emoji: '🏢' },
  ];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>
      <SubTabs items={subtabs} />

      {/* Подход */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Подход к планированию</h3>
          <InfoHint text={INSTRUCTIONS.approach} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {approaches.map(a => (
            <button
              key={a.id}
              className="card-interactive"
              onClick={() => setGoals(g => ({ ...g, approach: a.id }))}
              style={{
                padding: 16,
                textAlign: 'left',
                borderColor: goals.approach === a.id ? 'var(--accent)' : 'var(--border)',
                background: goals.approach === a.id ? 'var(--accent-light)' : 'var(--bg-card)',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 6 }}>{a.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 2 колонки: личные + компания */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
        {/* ЛИЧНЫЕ ЦЕЛИ */}
        {(goals.approach === 'personal' || goals.approach === 'both') && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>🌸 Личные цели на год</h3>
              <InfoHint text={INSTRUCTIONS.personalGoals} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {goals.personalGoals.map((g, idx) => (
                <div key={g.id} style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input-field"
                    style={{ flex: 1 }}
                    placeholder={`Цель ${idx + 1}`}
                    value={g.name}
                    onChange={(e) => setGoals(st => ({ ...st, personalGoals: st.personalGoals.map(x => x.id === g.id ? { ...x, name: e.target.value } : x) }))}
                  />
                  <div style={{ width: 140 }}>
                    <MoneyInput value={g.amount} onChange={v => setGoals(st => ({ ...st, personalGoals: st.personalGoals.map(x => x.id === g.id ? { ...x, amount: v } : x) }))} />
                  </div>
                  <button className="btn-icon" onClick={() => setGoals(st => ({ ...st, personalGoals: st.personalGoals.filter(x => x.id !== g.id) }))} aria-label="Удалить">✕</button>
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={addPersonalGoal}>+ Добавить цель</button>
            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Итого личные:</span>
              <span className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(t.personalGoalsTotal)}</span>
            </div>
          </div>
        )}
        {/* ЦЕЛИ КОМПАНИИ */}
        {(goals.approach === 'company' || goals.approach === 'both') && (
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>🏢 Цели компании на год</h3>
              <InfoHint text={INSTRUCTIONS.companyGoals} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {goals.companyGoals.map((g, idx) => (
                <div key={g.id} style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="input-field"
                    style={{ flex: 1 }}
                    placeholder={`Цель ${idx + 1}`}
                    value={g.name}
                    onChange={(e) => setGoals(st => ({ ...st, companyGoals: st.companyGoals.map(x => x.id === g.id ? { ...x, name: e.target.value } : x) }))}
                  />
                  <div style={{ width: 140 }}>
                    <MoneyInput value={g.amount} onChange={v => setGoals(st => ({ ...st, companyGoals: st.companyGoals.map(x => x.id === g.id ? { ...x, amount: v } : x) }))} />
                  </div>
                  <button className="btn-icon" onClick={() => setGoals(st => ({ ...st, companyGoals: st.companyGoals.filter(x => x.id !== g.id) }))} aria-label="Удалить">✕</button>
                </div>
              ))}
            </div>
            <button className="btn-secondary" onClick={addCompanyGoal}>+ Добавить цель</button>
            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Оборот компании:</span>
              <span className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(t.companyGoalsTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Годовая сумма целей */}
      <div className="stat-card-glass" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Годовая сумма финансовых целей</div>
          <div className="tabular" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>{fmtMoney(t.annualGoalsTotal)}</div>
        </div>
        <span className="badge badge-purple">L20 = личные + компания</span>
      </div>

      {/* ЗАТРАТЫ */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Ежемесячные базовые затраты</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Личные расходы</h3>
            <InfoHint text={INSTRUCTIONS.personalExpenses} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.personalExpenses.map((e) => (
              <div key={e.id} style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input-field"
                  style={{ flex: 1 }}
                  placeholder="Статья"
                  value={e.name}
                  onChange={(ev) => setGoals(st => ({ ...st, personalExpenses: st.personalExpenses.map(x => x.id === e.id ? { ...x, name: ev.target.value } : x) }))}
                />
                <div style={{ width: 140 }}>
                  <MoneyInput value={e.amount} onChange={v => setGoals(st => ({ ...st, personalExpenses: st.personalExpenses.map(x => x.id === e.id ? { ...x, amount: v } : x) }))} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>В месяц / За год:</span>
            <span className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(t.personalMonthlyExpenses)} / {fmtMoney(t.personalAnnualExpenses)}</span>
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Расходы компании</h3>
            <InfoHint text={INSTRUCTIONS.companyExpenses} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.companyExpenses.map((e) => (
              <div key={e.id} style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input-field"
                  style={{ flex: 1 }}
                  placeholder="Статья"
                  value={e.name}
                  onChange={(ev) => setGoals(st => ({ ...st, companyExpenses: st.companyExpenses.map(x => x.id === e.id ? { ...x, name: ev.target.value } : x) }))}
                />
                <div style={{ width: 140 }}>
                  <MoneyInput value={e.amount} onChange={v => setGoals(st => ({ ...st, companyExpenses: st.companyExpenses.map(x => x.id === e.id ? { ...x, amount: v } : x) }))} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>В месяц / За год:</span>
            <span className="tabular" style={{ fontWeight: 700 }}>{fmtMoney(t.companyMonthlyExpenses)} / {fmtMoney(t.companyAnnualExpenses)}</span>
          </div>
        </div>
      </div>

      {/* ФИНАЛ */}
      <div className="stat-card-purple" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>ИТОГО НЕОБХОДИМО за год</div>
        <div className="tabular" style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1 }}>{fmtMoney(t.totalNeeded)}</div>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 8 }}>
          Цели ({fmtMoney(t.annualGoalsTotal)}) + затраты ({fmtMoney(t.annualBase)}) · В месяц в среднем: {fmtMoney(t.totalNeeded / 12)}
        </div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 40 }}>
        <label className="input-label">Вывод для себя о постановке исходной годовой цели</label>
        <textarea
          className="input-field"
          placeholder="Что я понял(а) о своей цели? Реалистична ли она? Что нужно подправить?..."
          value={goals.conclusion}
          onChange={(e) => setGoals(g => ({ ...g, conclusion: e.target.value }))}
          rows={3}
        />
      </div>
    </div>
  );
}
