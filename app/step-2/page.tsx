'use client';

import { useStore } from '@/lib/store';
import { InfoHint } from '@/components/InfoHint';
import { STEP_INTROS, INSTRUCTIONS } from '@/lib/instructions';
import { MONTH_NAMES_RU } from '@/lib/defaults';
import { useState, useMemo, useEffect } from 'react';
import type { DayType } from '@/lib/types';
import { Sheet } from '@/components/Sheet';

const DAY_TYPE_META: Record<DayType, { label: string; color: string; bg: string }> = {
  weekend:          { label: 'Выходной',         color: '#991B1B', bg: '#FEE2E2' },
  vacation:         { label: 'Отпуск',            color: '#1E40AF', bg: '#DBEAFE' },
  event:            { label: 'Событие',           color: '#92400E', bg: '#FEF3C7' },
  training:         { label: 'Обучение',          color: '#166534', bg: '#DCFCE7' },
  selling_first:    { label: 'Продажа · 1 рука',  color: '#7E22CE', bg: '#F3E8FF' },
  selling_standard: { label: 'Продажа · стандарт',color: '#7E22CE', bg: '#F3E8FF' },
  selling_final:    { label: 'Продажа · финал',   color: '#7E22CE', bg: '#F3E8FF' },
  closed_sale:      { label: 'Закрытая продажа',  color: '#9D174D', bg: '#FCE7F3' },
  reserved:         { label: 'Резерв',            color: '#3C3C43', bg: '#E5E5EA' },
  development:      { label: 'Разработка',        color: '#B91C1C', bg: '#FEE2E2' },
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
  const calendarYear = state.calendarYear;
  const setCalendarYear = state.setCalendarYear;
  const startMonth = state.startMonth;
  const setStartMonth = state.setStartMonth;

  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [multiMode, setMultiMode] = useState(false);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  // Drag to select
  const [dragging, setDragging] = useState(false);
  const [dragAction, setDragAction] = useState<'add' | 'remove'>('add');

  useEffect(() => {
    const up = () => setDragging(false);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, []);

  const daysMap = useMemo(() => new Map(calendar.days.map(d => [d.date, d])), [calendar.days]);

  const toggleType = (date: string, t: DayType) => {
    setCalendar(c => {
      const existing = c.days.find(d => d.date === date);
      if (!existing) return { ...c, days: [...c.days, { date, types: [t] }] };
      const types = existing.types.includes(t) ? existing.types.filter(x => x !== t) : [...existing.types, t];
      if (types.length === 0 && !existing.note) return { ...c, days: c.days.filter(d => d.date !== date) };
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

  const applyBulkType = (t: DayType) => {
    setCalendar(c => {
      const dates = Array.from(selection);
      let days = [...c.days];
      for (const date of dates) {
        const idx = days.findIndex(d => d.date === date);
        if (idx === -1) {
          days.push({ date, types: [t] });
        } else if (!days[idx].types.includes(t)) {
          days[idx] = { ...days[idx], types: [...days[idx].types, t] };
        }
      }
      return { ...c, days };
    });
  };

  const clearBulkTypes = () => {
    setCalendar(c => ({
      ...c,
      days: c.days.filter(d => !selection.has(d.date) || d.note).map(d =>
        selection.has(d.date) ? { ...d, types: [] } : d
      ),
    }));
  };

  const handleDayMouseDown = (dateStr: string) => {
    if (!multiMode) return;
    const on = selection.has(dateStr);
    setDragAction(on ? 'remove' : 'add');
    setDragging(true);
    setSelection(s => {
      const next = new Set(s);
      if (on) next.delete(dateStr); else next.add(dateStr);
      return next;
    });
  };
  const handleDayMouseEnter = (dateStr: string) => {
    if (!multiMode || !dragging) return;
    setSelection(s => {
      const next = new Set(s);
      if (dragAction === 'add') next.add(dateStr); else next.delete(dateStr);
      return next;
    });
  };
  const handleDayClick = (dateStr: string) => {
    if (multiMode) {
      setSelection(s => {
        const next = new Set(s);
        if (next.has(dateStr)) next.delete(dateStr); else next.add(dateStr);
        return next;
      });
    } else {
      setEditingDay(dateStr);
    }
  };

  const selectWeekends = () => {
    const set = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const m = (startMonth + i) % 12;
      const y = calendarYear + Math.floor((startMonth + i) / 12);
      const dim = daysInMonth(y, m);
      for (let d = 1; d <= dim; d++) {
        const dt = new Date(y, m, d);
        const wd = dt.getDay();
        if (wd === 0 || wd === 6) {
          set.add(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
        }
      }
    }
    setSelection(set);
  };

  const yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 1 + i);

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>

      {/* Settings bar */}
      <div className="card" style={{ padding: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Год</span>
          <select className="input-field" style={{ minWidth: 100, minHeight: 38 }} value={calendarYear} onChange={(e) => setCalendarYear(Number(e.target.value))}>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Начать с месяца</span>
          <select className="input-field" style={{ minWidth: 140, minHeight: 38 }} value={startMonth} onChange={(e) => setStartMonth(Number(e.target.value))}>
            {MONTH_NAMES_RU.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }} />
        <button
          className={multiMode ? 'btn-primary' : 'btn-secondary'}
          onClick={() => { setMultiMode(m => !m); setSelection(new Set()); }}
          style={{ minHeight: 38 }}
        >
          {multiMode ? '✓ Режим выбора' : '📌 Выбрать несколько'}
        </button>
      </div>

      {/* Multi-select panel */}
      {multiMode && (
        <div className="stat-card-glass" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Выбрано: <span className="tabular" style={{ color: 'var(--accent)' }}>{selection.size}</span></span>
          <div style={{ flex: 1, minWidth: 12 }} />
          <button className="btn-ghost" onClick={selectWeekends}>Авто: выходные за год</button>
          <button className="btn-ghost" onClick={() => setSelection(new Set())} disabled={selection.size === 0}>Сбросить</button>
          <button className="btn-primary" onClick={() => setBulkOpen(true)} disabled={selection.size === 0}>Применить тип →</button>
        </div>
      )}

      {/* Legend */}
      <div className="card" style={{ padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginRight: 4 }}>Типы:</span>
        {Object.entries(DAY_TYPE_META).map(([k, m]) => (
          <span key={k} className="badge" style={{ background: m.bg, color: m.color }}>{m.label}</span>
        ))}
        <InfoHint text={INSTRUCTIONS.calendar} />
      </div>

      {/* 12 мини-календарей */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 40, userSelect: multiMode ? 'none' : 'auto' }}>
        {Array.from({ length: 12 }, (_, i) => {
          const m = (startMonth + i) % 12;
          const y = calendarYear + Math.floor((startMonth + i) / 12);
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
                  const isSel = selection.has(dateStr);
                  return (
                    <button
                      key={idx}
                      onMouseDown={() => handleDayMouseDown(dateStr)}
                      onMouseEnter={() => handleDayMouseEnter(dateStr)}
                      onClick={() => handleDayClick(dateStr)}
                      style={{
                        aspectRatio: '1',
                        border: isSel ? '2px solid var(--accent)' : 'none',
                        borderRadius: 8,
                        background: isSel ? 'var(--accent-light)' : (meta?.bg || 'transparent'),
                        color: isSel ? 'var(--accent)' : (meta?.color || 'var(--text-primary)'),
                        fontSize: 12,
                        fontWeight: day?.types.length || isSel ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'background 0.1s, border 0.1s',
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

      {/* Single-day editor */}
      {editingDay && !multiMode && (
        <Sheet open={!!editingDay} onClose={() => setEditingDay(null)} title={editingDay}>
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
                      border: 'none', width: '100%',
                      background: active ? m.bg : 'var(--bg-card)',
                      textAlign: 'left', cursor: 'pointer', borderRadius: 8,
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

      {/* Bulk editor */}
      {bulkOpen && (
        <Sheet open onClose={() => setBulkOpen(false)} title={`Применить к ${selection.size} дням`}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Выбери тип — он добавится ко всем выбранным дням. Существующие типы сохранятся.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {Object.entries(DAY_TYPE_META).map(([k, m]) => (
              <button
                key={k}
                className="list-item"
                style={{ border: 'none', width: '100%', background: m.bg, textAlign: 'left', cursor: 'pointer', borderRadius: 8, color: m.color, fontWeight: 700 }}
                onClick={() => { applyBulkType(k as DayType); setBulkOpen(false); setMultiMode(false); setSelection(new Set()); }}
              >
                <span style={{ flex: 1 }}>{m.label}</span>
                <span>→</span>
              </button>
            ))}
          </div>
          <button
            className="btn-secondary"
            style={{ width: '100%', color: '#991B1B' }}
            onClick={() => { clearBulkTypes(); setBulkOpen(false); setMultiMode(false); setSelection(new Set()); }}
          >
            Очистить все типы у выбранных дней
          </button>
        </Sheet>
      )}
    </div>
  );
}
