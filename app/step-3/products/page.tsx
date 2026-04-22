'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { InfoHint } from '@/components/InfoHint';
import { SubTabs } from '@/components/SubTabs';
import { Sheet } from '@/components/Sheet';
import { STEPS } from '@/lib/steps';
import { INSTRUCTIONS, STEP_INTROS } from '@/lib/instructions';
import { PRODUCT_FORMATS, LINEUP_STRUCTURES } from '@/lib/defaults';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const state = useStore();
  const products = state.products.products;
  const audience = state.audience;
  const setProducts = state.setProducts;
  const addProduct = state.addProduct;
  const removeProduct = state.removeProduct;
  const updateProduct = state.updateProduct;
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = products.find(p => p.id === editingId);
  const intro = STEP_INTROS['step-3/products'];
  const subtabs = STEPS.find(s => s.id === 'step-3')!.children!;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>
      <SubTabs items={subtabs} />

      {/* Общие данные */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Общие параметры линейки</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          <div>
            <label className="input-label">
              Вид структуры линейки
              <InfoHint text={INSTRUCTIONS.lineupStructure} />
            </label>
            <select
              className="input-field"
              value={state.products.lineupStructure}
              onChange={(e) => setProducts(p => ({ ...p, lineupStructure: e.target.value }))}
            >
              <option value="">Выберите...</option>
              {LINEUP_STRUCTURES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Почему именно он?</label>
            <input
              className="input-field"
              value={state.products.lineupStructureReason}
              onChange={(e) => setProducts(p => ({ ...p, lineupStructureReason: e.target.value }))}
              placeholder="Одной фразой"
            />
          </div>
        </div>
      </div>

      {/* Сетка карточек */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
        {products.map((p, i) => {
          const linkedAud = audience.find(a => a.id === p.audienceGroupId);
          return (
            <div key={p.id} className="card-interactive" style={{ padding: 18 }} onClick={() => setEditingId(p.id)}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>Продукт {i + 1}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{p.name || 'Без названия'}</div>
                </div>
                <span className={`badge ${p.requestKind === 'key' ? 'badge-purple' : 'badge-blue'}`}>
                  {p.requestKind === 'key' ? 'Ключевой' : 'Дополняющий'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {p.format || 'Формат не указан'}
              </div>
              {linkedAud?.summary && (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: 8, background: 'var(--bg-inset)', borderRadius: 8 }}>
                  Запрос: {linkedAud.summary}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        <button className="btn-primary" onClick={addProduct}>+ Добавить продукт</button>
        {products.length > 1 && editing && (
          <button
            className="btn-secondary"
            style={{ color: '#991B1B' }}
            onClick={() => { if (confirm('Удалить продукт?')) { removeProduct(editing.id); setEditingId(null); } }}
          >
            Удалить текущий
          </button>
        )}
      </div>

      {/* Sheet — редактирование продукта */}
      {editing && (
        <ProductSheet
          product={editing}
          audience={audience}
          onClose={() => setEditingId(null)}
          onChange={(patch) => updateProduct(editing.id, patch)}
        />
      )}
    </div>
  );
}

function ProductSheet({ product, audience, onClose, onChange }: {
  product: Product;
  audience: { id: string; summary: string }[];
  onClose: () => void;
  onChange: (patch: Partial<Product>) => void;
}) {
  const [tab, setTab] = useState<'basic' | 'value' | 'content'>('basic');

  return (
    <Sheet open onClose={onClose} title="Редактировать продукт">
      <div className="subtabs" style={{ marginBottom: 16 }}>
        <button className={`subtab ${tab === 'basic' ? 'active' : ''}`} onClick={() => setTab('basic')}>Основа</button>
        <button className={`subtab ${tab === 'value' ? 'active' : ''}`} onClick={() => setTab('value')}>Ценность</button>
        <button className={`subtab ${tab === 'content' ? 'active' : ''}`} onClick={() => setTab('content')}>Содержание</button>
      </div>

      {tab === 'basic' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="input-label">Название <InfoHint text={INSTRUCTIONS.productName} /></label>
            <input className="input-field" value={product.name} onChange={e => onChange({ name: e.target.value })} placeholder="Название продукта" />
          </div>
          <div>
            <label className="input-label">Формат <InfoHint text={INSTRUCTIONS.productFormat} /></label>
            <select className="input-field" value={product.format} onChange={e => onChange({ format: e.target.value })}>
              <option value="">Выберите...</option>
              {PRODUCT_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Какой запрос аудитории закрывает</label>
            <select
              className="input-field"
              value={product.audienceGroupId || ''}
              onChange={e => onChange({ audienceGroupId: e.target.value || undefined })}
            >
              <option value="">Выберите из шага 3.1...</option>
              {audience.filter(a => a.summary).map(a => <option key={a.id} value={a.id}>{a.summary}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Тип запроса <InfoHint text={INSTRUCTIONS.productRequestKind} /></label>
            <div className="segmented">
              <button className={`segmented-item ${product.requestKind === 'key' ? 'active' : ''}`} onClick={() => onChange({ requestKind: 'key' })}>Ключевой</button>
              <button className={`segmented-item ${product.requestKind === 'supporting' ? 'active' : ''}`} onClick={() => onChange({ requestKind: 'supporting' })}>Дополняющий</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'value' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label className="input-label">Результат для клиента <InfoHint text={INSTRUCTIONS.productResult} /></label>
            <textarea className="input-field" rows={3} value={product.result} onChange={e => onChange({ result: e.target.value })} placeholder="Что получит клиент после? На языке клиента" />
          </div>
          <div>
            <label className="input-label">Дополнительная ценность <InfoHint text={INSTRUCTIONS.productExtraValue} /></label>
            <textarea className="input-field" rows={3} value={product.extraValue} onChange={e => onChange({ extraValue: e.target.value })} placeholder="Бонусы, сообщество, персональная связь" />
          </div>
        </div>
      )}

      {tab === 'content' && (
        <div>
          <label className="input-label">Темы / задачи для решения <InfoHint text={INSTRUCTIONS.productContent} /></label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {product.content.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 6 }}>
                <input
                  className="input-field"
                  style={{ flex: 1 }}
                  placeholder={`Тема ${i + 1}`}
                  value={c}
                  onChange={(e) => onChange({ content: product.content.map((x, j) => j === i ? e.target.value : x) })}
                />
                <button className="btn-icon" onClick={() => onChange({ content: product.content.filter((_, j) => j !== i) })} aria-label="Удалить">✕</button>
              </div>
            ))}
          </div>
          <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => onChange({ content: [...product.content, ''] })}>
            + Добавить тему
          </button>
        </div>
      )}
    </Sheet>
  );
}
