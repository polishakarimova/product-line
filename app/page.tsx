'use client';

import Link from 'next/link';
import { useStore } from '@/lib/store';
import { goalsTotals, monthlyTotals, pricingTotals, finalDecompositionYearTotal, progressByStep, fmtMoney } from '@/lib/formulas';
import { STEPS } from '@/lib/steps';
import { ProgressRing } from '@/components/ProgressRing';
import { ExportMenu } from '@/components/ExportMenu';
import { useMemo } from 'react';

export default function Home() {
  const state = useStore();
  const { gt, mt, products, progress, avgCheck, finalYear } = useMemo(() => {
    const gt = goalsTotals(state.goals);
    const mt = monthlyTotals(state.monthly, state.goals);
    const products = state.products.products.filter(p => p.name.trim());
    const progress = progressByStep(state);
    // Средний чек линейки = среднее по всем продуктам
    const avgChecks = state.pricing.map(p => pricingTotals(p).avgCheck).filter(x => x > 0);
    const avgCheck = avgChecks.length ? avgChecks.reduce((a, b) => a + b, 0) / avgChecks.length : 0;
    const finalYear = finalDecompositionYearTotal(state.assembly.finalDecomposition);
    return { gt, mt, products, progress, avgCheck, finalYear };
  }, [state]);

  const progressMap: Record<string, number> = {
    'step-1': progress.step1, 'step-2': progress.step2, 'step-3': progress.step3,
    'step-4': progress.step4, 'step-5': progress.step5, 'step-6': progress.step6,
  };

  const remaining = STEPS.filter(s => progressMap[s.id] < 1).map(s => s.title).slice(0, 3);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{state.workspaceName}</h1>
          <p className="page-subtitle">Сервис-конструктор годовой товарной линейки · 6 шагов · все формулы и связи сохранены</p>
        </div>
        <ExportMenu />
      </div>

      {/* БОЛЬШОЙ HERO С ПРОГРЕССОМ И ГЛАВНЫМИ ЦИФРАМИ */}
      <div className="stat-card-purple" style={{ marginBottom: 20, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ProgressRing value={progress.overall} size={88} stroke={8} />
            <span style={{ position: 'absolute', fontSize: 20, fontWeight: 800, color: '#fff' }}>{Math.round(progress.overall * 100)}%</span>
          </div>
          <div>
            <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4, letterSpacing: 0.3, textTransform: 'uppercase', fontWeight: 600 }}>Заполнено</div>
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2 }}>
              {remaining.length === 0 ? 'Всё готово! 🎉' : `Осталось: ${remaining.join(', ')}`}
            </div>
          </div>
        </div>
      </div>

      {/* 4 МЕТРИКИ — главные цифры */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        <div className="stat-card-glass">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>Цель года</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }} className="tabular">{fmtMoney(gt.totalNeeded)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>В месяц в среднем: {fmtMoney(gt.totalNeeded / 12)}</div>
        </div>
        <div className="stat-card-glass">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>Средний чек линейки</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }} className="tabular">{fmtMoney(avgCheck)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>По всем продуктам</div>
        </div>
        <div className="stat-card-glass">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>Продуктов</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }} className="tabular">{products.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>В линейке</div>
        </div>
        <div className="stat-card-glass">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 }}>Сборка даст за год</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }} className="tabular">{fmtMoney(finalYear)}</div>
          <div style={{ fontSize: 12, color: finalYear >= gt.totalNeeded && gt.totalNeeded > 0 ? '#166534' : 'var(--text-secondary)', marginTop: 4 }}>
            {gt.totalNeeded > 0 ? `${Math.round(finalYear / gt.totalNeeded * 100)}% от цели` : '—'}
          </div>
        </div>
      </div>

      {/* КАРТОЧКИ ШАГОВ */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>6 шагов методологии</h2>
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Можно проходить в любом порядке</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {STEPS.map(step => {
          const p = progressMap[step.id];
          const isDone = p >= 1;
          return (
            <Link key={step.id} href={step.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card-interactive" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 32 }}>{step.emoji}</span>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Шаг {step.num}</div>
                      <div style={{ fontSize: 17, fontWeight: 700 }}>{step.title}</div>
                    </div>
                  </div>
                  {isDone && <span className="badge badge-green">✓ готов</span>}
                </div>
                <div className="progress-bar" style={{ marginBottom: 8 }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.round(p * 100)}%` }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>{Math.round(p * 100)}% готово</span>
                  {step.children && <span style={{ color: 'var(--text-tertiary)' }}>{step.children.length} раздела</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ТЕКУЩИЙ МИНИ-ДАШБОРД */}
      {mt.yearTotal > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Распределение оборота по месяцам</h3>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0' }}>
            {mt.rows.map(r => {
              const maxHeight = Math.max(...mt.rows.map(x => x.totalForMonth)) || 1;
              const h = (r.totalForMonth / maxHeight) * 80;
              return (
                <div key={r.month} style={{ flex: '0 0 64px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ height: 80, display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{
                      width: 24,
                      height: h,
                      background: 'linear-gradient(180deg, var(--purple-400), var(--accent))',
                      borderRadius: 4,
                      boxShadow: '0 2px 8px rgba(147,51,234,0.2)',
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>{r.month.slice(0, 3)}</span>
                  <span style={{ fontSize: 10 }} className="tabular">{r.totalForMonth > 0 ? `${Math.round(r.totalForMonth / 1000)}к` : '—'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24, paddingBottom: 40 }}>
        Данные автосохраняются в браузере · Для обмена с подругой используйте «Экспорт JSON»
      </p>
    </div>
  );
}
