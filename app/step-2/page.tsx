'use client';

import { useStore } from '@/lib/store';
import { InfoHint } from '@/components/InfoHint';
import { STEP_INTROS, INSTRUCTIONS } from '@/lib/instructions';
import { MONTH_NAMES_RU } from '@/lib/defaults';
import { useState, useMemo } from 'react';
import type { DayType } from '@/lib/types';
import { Sheet } from '@/components/Sheet';

const DAY_TYPE_META: Record<DayType, { label: string; color: string; bg: string }> = {
  weekend:         { label: 'Выходной',        color: '#991B1B', bg: '#FEE2E2' },
  vacation:        { label: 'Отпуск',           color: '#1E40AF', bg: '#DBEAFE' },
  event:           { label: 'Событие',          color: '#92400E', bg: '#FEF3C7' },
  training:        { label: 'Обучение',         color: '#166534', bg: '#DCFCE7' },
  selling_first:   { label: 'Продажа · 1 рука', color: '#7E22CE', bg: '#F3E8FF' },
  selling_standard:{ label: 'Продажа · стандарт', color: '#7E22CE', bg: '#F3E8FF' },
  selling_final:   { label: 'Продажа · финал',  color: '#7E22CE', bg: '#F3E8FF' },
  closed_sale:     { label: 'Закрытая продажа', color: '#9D174D', bg: '#FCE7F3' },
  reserved:        { label: 'Резерв',           color: '#3C3C43', bg: '#E5E5EA' },
  development:     { label: 'Разработка',       color: '#B91C1C', bg: '#FEE2E2' },
};

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function daysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function firstWeekday(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function CalendarPage() {
  const state = useStore();
  const calendar = state.calendar;
  const setCalendar = state.setCalendar;
  const intro = STEP_INTROS['step-2'];
  const year = useMemo(() => new Date().getFullYear(), []);
  const startMonth = state.startMonth;
  const [editingDay, setEditingDay] = useState<string | null>(null);

  const daysMap = useMemo(() => {
    const map = new Map(calendar.days.map(d => [d.date, d]));
    return map;
  }, [calendar.days]);

  const toggleType = (date: string, t: DayType) => {
    setCalendar(c => {
      const existing = c.days.find(d => d.date === date);
      if (!existing) {
        return { ...c, days: [...c.days, { date, types: [t] }] };
      }
      const types = existing.types.includes(t) ? existing.types.filter(x => x !== t) : [...existing.types, t];
      if (types.length === 0) return { ...c, days: c.days.filter(d => d.date !== date) };
      return { ...c, days: c.days.map(d => d.date === date ? { ...d, types } : d) };
    });
  };

  const updateNote = (date: string, note: string) => {
    setCalendar(c => {
      const existing = c.days.find(d => d.date === date);
      if (!existing && note) return { ...c, days: [...c.days, { date, types: [], note }] };
      if (!existing) return c;
      return { ...c, days: c.days.map(d => d.date === date ? { ...d, note } : d) };
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

      {/* Легенда */}
      <div className="card" style={{ padding: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginRight: 8 }}>Типы дней:</span>
        {Object.entries(DAY_TYPE_META).map(([k, m]) => (
          <span key={k} className="badge" style={{ background: m.bg, color: m.color }}>{m.label}</span>
        ))}
        <InfoHint text={INSTRUCTIONS.calendar} />
      </div>

      {/* 12 мини-календарей */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 40 }}>
        {Array.from({ length: 12 }, (_, i) => {
          const m = (startMonth + i) % 12;
          const y = year + Math.floor((startMonth + i) / 12);
          const dim = daysInMonth(y, m);
          const offset = firstWeekday(y, m);
          const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
          while (cells.length % 7) cells.push(null);
          return (
            <div key={`${y}-${m}`} className="card" style={{ padding: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{MONTH_NAMES_RU[m]} {y}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {WEEKDAYS.map(w => <div key={w} style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', fontWeight: 600, padding: 4 }}>{w}</div>)}
                {cells.map((n, idx) => {
                  if (n === null) return <div key={idx} />;
                  const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
                  const day = daysMap.get(dateStr);
                  const firstType = day?.types[0];
                  const meta = firstType ? DAY_TYPE_META[firstType] : null;
                  return (
                    <button
                      key={idx}
                      onClick={() => setEditingDay(dateStr)}
                      style={{
                        aspectRatio: '1',
                        border: 'none',
                        borderRadius: 8,
                        background: meta?.bg || 'transparent',
                        color: meta?.color || 'var(--text-primary)',
                        fontSize: 12,
                        fontWeight: day?.types.length ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        minHeight: 32,
                        position: 'relative',
                      }}
                    >
                      {n}
                      {day && day.types.length > 1 && (
                        <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 8 }}>+{day.types.length - 1}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Модалка */}
      {editingDay && (
        <Sheet open={!!editingDay} onClose={() => setEditingDay(null)} title={`${editingDay}`}>
          <div style={{ marginBottom: 20 }}>
            <label className="input-label">Тип дня (можно несколько)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.entries(DAY_TYPE_META).map(([k, m]) => {
                const d = daysMap.get(editingDay);
                const active = d?.types.includes(k as DayType) || false;
                return (
                  <button
                    key={k}
                    className="list-item"
                    style={{
                      border: 'none',
                      width: '100%',
                      background: active ? m.bg : 'var(--bg-card)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: 8,
                      color: active ? m.color : 'var(--text-primary)',
                    }}
                    onClick={() => toggleType(editingDay, k as DayType)}
                  >
                    <span style={{ flex: 1 }}>{m.label}</span>
                    {active && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="input-label">Описание</label>
            <textarea
              className="input-field"
              placeholder="Что запланировано на этот день?"
              value={daysMap.get(editingDay)?.note || ''}
              onChange={(e) => updateNote(editingDay, e.target.value)}
              rows={3}
            />
          </div>
        </Sheet>
      )}
    </div>
  );
}
