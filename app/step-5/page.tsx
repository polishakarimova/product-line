'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { InfoHint } from '@/components/InfoHint';
import { MoneyInput } from '@/components/MoneyInput';
import { STEP_INTROS, INSTRUCTIONS } from '@/lib/instructions';
import { pricingTotals, monthlyTotals, finalDecompositionRowTotal, finalDecompositionYearTotal, fmtMoney, goalsTotals } from '@/lib/formulas';
import { Sheet } from '@/components/Sheet';

export default function AssemblyPage() {
  const state = useStore();
  const intro = STEP_INTROS['step-5'];
  const products = state.products.products;
  const assembly = state.assembly.assembly;
  const finalDec = state.assembly.finalDecomposition;
  const [editingRow, setEditingRow] = useState<number | null>(null);

  const gt = goalsTotals(state.goals);
  const mt = monthlyTotals(state.monthly, state.goals);
  const yearTotal = finalDecompositionYearTotal(finalDec);

  const productChecks = useMemo(() => {
    const map = new Map<string, number>();
    state.pricing.forEach(p => { map.set(p.productId, pricingTotals(p).avgCheck); });
    return map;
  }, [state.pricing]);

  const updateAssembly = (productId: string, patch: Partial<typeof assembly[0]>) => {
    state.setAssembly(a => ({
      ...a,
      assembly: a.assembly.map(x => x.productId === productId ? { ...x, ...patch } : x),
    }));
  };

  const updateDecRow = (idx: number, patch: Partial<typeof finalDec[0]>) => {
    state.setAssembly(a => ({
      ...a,
      finalDecomposition: a.finalDecomposition.map((r, i) => i === idx ? { ...r, ...patch } : r),
    }));
  };

  const moveAssemblyLeft = (idx: number) => {
    if (idx === 0) return;
    state.setAssembly(a => {
      const arr = [...a.assembly];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...a, assembly: arr.map((x, i) => ({ ...x, position: i })) };
    });
  };
  const moveAssemblyRight = (idx: number) => {
    if (idx === assembly.length - 1) return;
    state.setAssembly(a => {
      const arr = [...a.assembly];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { ...a, assembly: arr.map((x, i) => ({ ...x, position: i })) };
    });
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>

      {/* ТРУБОПРОВОД */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🚀 Путь клиента по линейке</h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Каждая карточка — продукт. Стрелки показывают путь. Можно менять порядок.</p>

      <div className="pipeline-flow" style={{ marginBottom: 32 }}>
        {assembly.map((a, idx) => {
          const prod = products.find(p => p.id === a.productId);
          if (!prod) return null;
          const check = productChecks.get(a.productId) || 0;
          return (
            <div key={a.productId} style={{ display: 'flex', alignItems: 'stretch' }}>
              <div className="pipeline-node">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                  <span className="badge badge-purple">#{idx + 1}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn-icon" style={{ minWidth: 28, minHeight: 28, padding: 4 }} onClick={() => moveAssemblyLeft(idx)} disabled={idx === 0} aria-label="Влево">‹</button>
                    <button className="btn-icon" style={{ minWidth: 28, minHeight: 28, padding: 4 }} onClick={() => moveAssemblyRight(idx)} disabled={idx === assembly.length - 1} aria-label="Вправо">›</button>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{prod.name || `Продукт ${idx + 1}`}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{prod.format || '—'}</div>
                <div className="tabular" style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)', marginBottom: 10 }}>{fmtMoney(check)}</div>
                <input
                  className="input-field"
                  style={{ fontSize: 12, padding: '8px 10px', minHeight: 36 }}
                  placeholder="Функция в линейке..."
                  value={a.functionInLineup}
                  onChange={e => updateAssembly(a.productId, { functionInLineup: e.target.value })}
                />
              </div>
              {idx < assembly.length - 1 && <div className="pipeline-arrow">→</div>}
            </div>
          );
        })}
      </div>

      {/* Сводная таблица продуктов */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Сводная информация по продуктам</h2>
      <div className="list-group" style={{ marginBottom: 32, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '50px 1.5fr 1fr 1.2fr 80px 80px 80px 80px', gap: 8, padding: '10px 16px', background: 'var(--bg-inset)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: 0.3, minWidth: 900 }}>
          <span>№</span><span>Название</span><span>Формат</span><span>Функция</span>
          <span title="Дни прогрева">Прогрев</span>
          <span title="Дни продаж">Продажи</span>
          <span title="Дни разработки">Разработка</span>
          <span title="Дни предоставления">Предоставл.</span>
        </div>
        {assembly.map((a, idx) => {
          const prod = products.find(p => p.id === a.productId);
          if (!prod) return null;
          return (
            <div key={a.productId} style={{ display: 'grid', gridTemplateColumns: '50px 1.5fr 1fr 1.2fr 80px 80px 80px 80px', gap: 8, padding: '10px 16px', borderBottom: '0.5px solid var(--border-soft)', alignItems: 'center', fontSize: 13, minWidth: 900 }}>
              <span className="tabular">{idx + 1}</span>
              <span style={{ fontWeight: 600 }}>{prod.name || '—'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{prod.format || '—'}</span>
              <input className="input-field" style={{ fontSize: 12, padding: '6px 10px', minHeight: 32 }} value={a.functionInLineup} onChange={e => updateAssembly(a.productId, { functionInLineup: e.target.value })} placeholder="Функция" />
              <MoneyInput value={a.warmupDays} onChange={v => updateAssembly(a.productId, { warmupDays: v })} />
              <MoneyInput value={a.sellingDaysOpen} onChange={v => updateAssembly(a.productId, { sellingDaysOpen: v })} />
              <MoneyInput value={a.developmentDays} onChange={v => updateAssembly(a.productId, { developmentDays: v })} />
              <MoneyInput value={a.deliveryDays} onChange={v => updateAssembly(a.productId, { deliveryDays: v })} />
            </div>
          );
        })}
      </div>

      {/* ФИНАЛЬНАЯ ДЕКОМПОЗИЦИЯ */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Финальная декомпозиция по месяцам</h2>
        <InfoHint text={INSTRUCTIONS.finalDecomposition} />
      </div>

      <div className="stat-card-purple" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>ИТОГО ЗА ГОД</div>
          <div className="tabular" style={{ fontSize: 28, fontWeight: 800 }}>{fmtMoney(yearTotal)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Цель на год</div>
          <div className="tabular" style={{ fontSize: 16, fontWeight: 700 }}>{fmtMoney(gt.totalNeeded)}</div>
          {gt.totalNeeded > 0 && (
            <span className="badge" style={{ background: yearTotal >= gt.totalNeeded ? '#DCFCE7' : 'rgba(255,255,255,0.18)', color: yearTotal >= gt.totalNeeded ? '#166534' : '#fff', marginTop: 4 }}>
              {Math.round(yearTotal / gt.totalNeeded * 100)}%
            </span>
          )}
        </div>
      </div>

      <div className="list-group" style={{ marginBottom: 40, overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1.5fr 120px 120px', padding: '10px 16px', background: 'var(--bg-inset)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: 0.3, gap: 8 }}>
          <span>Месяц</span><span>Цель</span><span>Продукт</span><span>Расчётное</span><span style={{ textAlign: 'right' }}>Статус</span>
        </div>
        {finalDec.map((row, idx) => {
          const calc = finalDecompositionRowTotal(row);
          const target = mt.rows[idx]?.totalForMonth || row.targetRevenue;
          const prod = products.find(p => p.id === row.productId);
          return (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1.5fr 120px 120px', gap: 8, padding: '10px 16px', borderBottom: '0.5px solid var(--border-soft)', alignItems: 'center', fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>{row.month}</span>
              <span className="tabular" style={{ color: 'var(--text-secondary)' }}>{fmtMoney(target)}</span>
              <select
                className="input-field"
                style={{ fontSize: 13, padding: '8px 12px', minHeight: 36 }}
                value={row.productId || ''}
                onChange={e => updateDecRow(idx, { productId: e.target.value || undefined })}
              >
                <option value="">—</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name || 'Без имени'}</option>)}
              </select>
              <button className="btn-secondary" style={{ minHeight: 36, padding: '6px 12px', fontSize: 13 }} onClick={() => setEditingRow(idx)}>
                <span className="tabular">{fmtMoney(calc)}</span>
              </button>
              <span style={{ textAlign: 'right' }}>
                {target === 0 && calc === 0 ? <span className="badge badge-gray">—</span> :
                  calc >= target ? <span className="badge badge-green">✓</span> :
                    <span className="badge badge-orange">{Math.round(calc / (target || 1) * 100)}%</span>}
              </span>
            </div>
          );
        })}
      </div>

      {/* Модалка редактирования строки декомпозиции */}
      {editingRow !== null && (
        <Sheet open onClose={() => setEditingRow(null)} title={`${finalDec[editingRow].month} — тарифы и кол-во продаж`}>
          {(['firstRight', 'standard', 'finalChance'] as const).map(stage => {
            const label = stage === 'firstRight' ? 'Право первой руки' : stage === 'standard' ? 'Стандартный этап' : 'Финальная возможность';
            const cur = finalDec[editingRow][stage];
            return (
              <div key={stage} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>{label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {(['min', 'base', 'max'] as const).map(tk => {
                    const priceKey = `${tk}Price` as 'minPrice' | 'basePrice' | 'maxPrice';
                    const qtyKey = `${tk}Qty` as 'minQty' | 'baseQty' | 'maxQty';
                    return (
                      <div key={tk}>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 4, textAlign: 'center' }}>
                          {tk === 'min' ? 'МИН' : tk === 'base' ? 'БАЗ' : 'МАКС'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <MoneyInput value={cur[priceKey]} onChange={v => updateDecRow(editingRow, { [stage]: { ...cur, [priceKey]: v } })} placeholder="Цена" />
                          <MoneyInput value={cur[qtyKey]} onChange={v => updateDecRow(editingRow, { [stage]: { ...cur, [qtyKey]: v } })} placeholder="Кол-во" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="stat-card-glass" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Расчётное значение</div>
            <div className="tabular" style={{ fontSize: 24, fontWeight: 800 }}>{fmtMoney(finalDecompositionRowTotal(finalDec[editingRow]))}</div>
          </div>
        </Sheet>
      )}
    </div>
  );
}
