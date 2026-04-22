'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { InfoHint } from '@/components/InfoHint';
import { MoneyInput } from '@/components/MoneyInput';
import { STEP_INTROS, INSTRUCTIONS } from '@/lib/instructions';
import { pricingTotals, fmtMoney } from '@/lib/formulas';

export default function PricingPage() {
  const products = useStore(s => s.products.products);
  const pricing = useStore(s => s.pricing);
  const updatePricing = useStore(s => s.updatePricing);
  const [expanded, setExpanded] = useState<string | null>(products[0]?.id || null);
  const intro = STEP_INTROS['step-4'];

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {products.map((product, idx) => {
          const p = pricing.find(x => x.productId === product.id);
          if (!p) return null;
          const totals = pricingTotals(p);
          const isOpen = expanded === product.id;
          return (
            <div key={product.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : product.id)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                }}
              >
                <span className="badge badge-purple">#{idx + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{product.name || `Продукт ${idx + 1}`}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    Базовая: <b className="tabular">{fmtMoney(totals.basePricePerParticipant)}</b>
                    {' · '}
                    Средний чек: <b className="tabular">{fmtMoney(totals.avgCheck)}</b>
                  </div>
                </div>
                <span style={{ fontSize: 18, color: 'var(--text-tertiary)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>›</span>
              </button>
              {isOpen && (
                <div style={{ padding: '0 20px 20px', borderTop: '0.5px solid var(--border-soft)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
                    {/* Затраты на создание */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700 }}>Затраты на создание</h4>
                        <InfoHint text={INSTRUCTIONS.creationCosts} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {p.creationCosts.map((c, i) => (
                          <div key={c.id} style={{ display: 'flex', gap: 6 }}>
                            <input
                              className="input-field"
                              style={{ flex: 1, fontSize: 13 }}
                              value={c.name}
                              onChange={e => updatePricing(product.id, { creationCosts: p.creationCosts.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })}
                            />
                            <div style={{ width: 110 }}>
                              <MoneyInput value={c.amount} onChange={v => updatePricing(product.id, { creationCosts: p.creationCosts.map((x, j) => j === i ? { ...x, amount: v } : x) })} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-inset)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Итого:</span>
                        <b className="tabular">{fmtMoney(totals.creationTotal)}</b>
                      </div>
                    </div>
                    {/* Затраты на предоставление */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700 }}>Затраты на предоставление</h4>
                        <InfoHint text={INSTRUCTIONS.deliveryCosts} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {p.deliveryCosts.map((c, i) => (
                          <div key={c.id} style={{ display: 'flex', gap: 6 }}>
                            <input
                              className="input-field"
                              style={{ flex: 1, fontSize: 13 }}
                              value={c.name}
                              onChange={e => updatePricing(product.id, { deliveryCosts: p.deliveryCosts.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })}
                            />
                            <div style={{ width: 110 }}>
                              <MoneyInput value={c.amount} onChange={v => updatePricing(product.id, { deliveryCosts: p.deliveryCosts.map((x, j) => j === i ? { ...x, amount: v } : x) })} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 8, padding: 10, background: 'var(--bg-inset)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Итого:</span>
                        <b className="tabular">{fmtMoney(totals.deliveryTotal)}</b>
                      </div>
                    </div>
                  </div>

                  {/* Параметры */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 16 }}>
                    <div>
                      <label className="input-label">Оптимально участников <InfoHint text={INSTRUCTIONS.optimalParticipants} /></label>
                      <MoneyInput value={p.optimalParticipants} onChange={v => updatePricing(product.id, { optimalParticipants: Math.max(1, v) })} />
                    </div>
                    <div>
                      <label className="input-label">Стоимость эксп. часа <InfoHint text={INSTRUCTIONS.expertHourRate} /></label>
                      <MoneyInput value={p.expertHourRate} onChange={v => updatePricing(product.id, { expertHourRate: v })} />
                    </div>
                    <div>
                      <label className="input-label">Часов на создание+ведение <InfoHint text={INSTRUCTIONS.expertHours} /></label>
                      <MoneyInput value={p.expertHours} onChange={v => updatePricing(product.id, { expertHours: v })} />
                    </div>
                    <div>
                      <label className="input-label">% на прибыль <InfoHint text={INSTRUCTIONS.profitPercent} /></label>
                      <input
                        type="number"
                        className="input-field input-money"
                        value={p.profitPercent || ''}
                        onChange={e => updatePricing(product.id, { profitPercent: Number(e.target.value) || 0 })}
                        placeholder="100"
                      />
                    </div>
                  </div>

                  {/* Расчёты */}
                  <div className="stat-card-glass" style={{ marginTop: 16, marginBottom: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Мин. себестоимость / 1</div>
                        <div className="tabular" style={{ fontSize: 16, fontWeight: 700 }}>{fmtMoney(totals.minCostPerParticipant)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Экспертиза / 1</div>
                        <div className="tabular" style={{ fontSize: 16, fontWeight: 700 }}>{fmtMoney(totals.expertCostPerParticipant)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>Базовая на 1 участника</div>
                        <div className="tabular" style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>{fmtMoney(totals.basePricePerParticipant)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Тарифы 3×3 */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700 }}>Тарифы × Этапы продаж</h4>
                    <InfoHint text={INSTRUCTIONS.tariffs} />
                  </div>
                  <div className="list-group" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '10px 12px', background: 'var(--bg-inset)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: 0.3, gap: 8 }}>
                      <span>Этап</span><span>Мин</span><span>Баз</span><span>Макс</span>
                    </div>
                    {(['firstRight', 'standard', 'finalChance'] as const).map((stage) => {
                      const label = stage === 'firstRight' ? 'Право первой руки' : stage === 'standard' ? 'Стандартный' : 'Финальная возможность';
                      return (
                        <div key={stage} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '8px 12px', borderBottom: '0.5px solid var(--border-soft)', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                          {(['min', 'base', 'max'] as const).map(t => (
                            <MoneyInput
                              key={t}
                              value={p[stage][t]}
                              onChange={v => updatePricing(product.id, { [stage]: { ...p[stage], [t]: v } })}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  <div className="stat-card-purple">
                    <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 }}>Средний чек по продукту</div>
                    <div className="tabular" style={{ fontSize: 28, fontWeight: 800 }}>{fmtMoney(totals.avgCheck)}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Среднее арифметическое 9 цен <InfoHint text={INSTRUCTIONS.avgCheckProduct} /></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
