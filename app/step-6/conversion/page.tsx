'use client';

import { useStore } from '@/lib/store';
import { SubTabs } from '@/components/SubTabs';
import { MoneyInput } from '@/components/MoneyInput';
import { InfoHint } from '@/components/InfoHint';
import { STEPS } from '@/lib/steps';
import { STEP_INTROS, INSTRUCTIONS } from '@/lib/instructions';

export default function ConversionPage() {
  const analytics = useStore(s => s.analytics);
  const setAnalytics = useStore(s => s.setAnalytics);
  const intro = STEP_INTROS['step-6/conversion'];
  const subtabs = STEPS.find(s => s.id === 'step-6')!.children!;

  const funnel = analytics.funnel;
  const firstCount = funnel[0]?.count || 1;
  const maxCount = funnel[0]?.count || 1;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>
      <SubTabs items={subtabs} />

      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>Этапы воронки</h3>
          <InfoHint text={INSTRUCTIONS.funnel} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {funnel.map((stage, idx) => {
            const convFromPrev = idx === 0 ? 100 : funnel[idx - 1].count > 0 ? (stage.count / funnel[idx - 1].count) * 100 : 0;
            const convFromFirst = firstCount > 0 ? (stage.count / firstCount) * 100 : 0;
            const barWidth = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            return (
              <div key={stage.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px 80px 40px', gap: 12, alignItems: 'center' }}>
                <input
                  className="input-field"
                  placeholder={`Этап ${idx + 1}`}
                  value={stage.name}
                  onChange={e => setAnalytics(a => ({ ...a, funnel: a.funnel.map(x => x.id === stage.id ? { ...x, name: e.target.value } : x) }))}
                />
                <MoneyInput value={stage.count} onChange={v => setAnalytics(a => ({ ...a, funnel: a.funnel.map(x => x.id === stage.id ? { ...x, count: v } : x) }))} />
                <div style={{ position: 'relative', height: 32, background: 'var(--bg-inset)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0,
                    width: `${barWidth}%`,
                    background: `linear-gradient(90deg, var(--purple-400), var(--accent))`,
                    transition: 'width 0.4s',
                  }} />
                </div>
                <span className="tabular" style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {idx === 0 ? '100%' : convFromPrev.toFixed(1) + '%'}
                </span>
                <span className="tabular" style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {idx === 0 ? '—' : convFromFirst.toFixed(1) + '%'}
                </span>
                <button className="btn-icon" onClick={() => setAnalytics(a => ({ ...a, funnel: a.funnel.filter(x => x.id !== stage.id) }))} aria-label="Удалить">✕</button>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px 80px 40px', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>
          <span>Название этапа</span>
          <span>Количество</span>
          <span>График</span>
          <span>С пред.</span>
          <span>От входа</span>
          <span></span>
        </div>

        <button
          className="btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => setAnalytics(a => ({ ...a, funnel: [...a.funnel, { id: Math.random().toString(36).slice(2, 9), name: '', count: 0 }] }))}
        >
          + Добавить этап
        </button>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>💡 Подсказка</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Типичная воронка для онлайн-продукта: <br/>
          <b>Охват → Посещение страницы → Регистрация → Оплата → Завершение</b>. <br/>
          Узкое место — этап с самой низкой конверсией с предыдущего. Начинайте оптимизировать с него.
        </p>
      </div>
    </div>
  );
}
