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
function toIso(d: Date) { return d.toISOString().slice(0, 10); }
function addDays(iso: string, n: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return toIso(d);
}
function diffDays(a: string, b: string) {
  const d1 = new Date(a), d2 = new Date(b);
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}
function enumRange(a: string, b: string): string[] {
  const result: string[] = [];
  const cur = new Date(a <= b ? a : b);
  const end = new Date(a <= b ? b : a);
  while (cur <= end) {
    result.push(toIso(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return result;
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
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');

  // When modal opens, reset to single mode with clicked day
  useEffect(() => {
    if (editingDay) {
      setMode('single');
      setRangeStart(editingDay);
      setRangeEnd(editingDay);
    }
  }, [editingDay]);

  const daysMap = useMemo(() => new Map(calendar.days.map(d => [d.date, d])), [calendar.days]);

  const toggleTypeSingle = (date: string, t: DayType) => {
    setCalendar(c => {
      const existing = c.days.find(d => d.date === date);
      if (!existing) return { ...c, days: [...c.days, { date, types: [t] }] };
      const types = existing.types.includes(t) ? existing.types.filter(x => x !== t) : [...existing.types, t];
      if (types.length === 0 && !existing.note) return { ...c, days: c.days.filter(d => d.date !== date) };
      return { ...c, days: c.days.map(d => d.date === date ? { ...d, types } : d) };
    });
  };

  const applyTypeRange = (start: string, end: string, t: DayType) => {
    const dates = enumRange(start, end);
    setCalendar(c => {
      let days = [...c.days];
      for (const date of dates) {
        const idx = days.findIndex(d => d.date === date);
        if (idx === -1) days.push({ date, types: [t] });
        else if (!days[idx].types.includes(t)) days[idx] = { ...days[idx], types: [...days[idx].types, t] };
      }
      return { ...c, days };
    });
  };

  const clearTypesRange = (start: string, end: string) => {
    const dates = new Set(enumRange(start, end));
    setCalendar(c => ({
      ...c,
      days: c.days
        .map(d => dates.has(d.date) ? { ...d, types: [] } : d)
        .filter(d => d.types.length > 0 || d.note),
    }));
  };

  const updateNote = (date: string, note: string) => {
    setCalendar(c => {
      const existing = c.days.find(d => d.date === date);
      if (!existing && note) return { ...c, days: [...c.days, { date, types: [], note }] };
      if (!existing) return c;
      return { ...c, days: c.days.map(d => d.date === date ? { ...d, note } : d) };
    });
  };

  const onTypeClick = (t: DayType) => {
    if (!editingDay) return;
    if (mode === 'single') {
      toggleTypeSingle(editingDay, t);
    } else {
      if (!rangeStart || !rangeEnd) return;
      applyTypeRange(rangeStart, rangeEnd, t);
    }
  };

  const onClear = () => {
    if (!editingDay) return;
    if (mode === 'single') {
      setCalendar(c => ({
        ...c,
        days: c.days.map(d => d.date === editingDay ? { ...d, types: [] } : d).filter(d => d.types.length > 0 || d.note),
      }));
    } else {
      clearTypesRange(rangeStart, rangeEnd);
    }
  };

  const yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 1 + i);

  const currentDay = editingDay ? daysMap.get(editingDay) : null;
  const rangeCount = mode === 'range' && rangeStart && rangeEnd ? Math.abs(diffDays(rangeStart, rangeEnd)) + 1 : 0;

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
      </div>

      {/* Legend */}
      <div className="card" style={{ padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginRight: 4 }}>Типы:</span>
        {Object.entries(DAY_TYPE_META).map(([k, m]) => (
          <span key={k} className="badge" style={{ background: m.bg, color: m.color }}>{m.label}</span>
        ))}
        <InfoHint text={INSTRUCTIONS.calendar} />
      </div>

      {/* 12 мини-календарей */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 40 }}>
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
                        transition: 'background 0.15s, transform 0.1s',
                        minHeight: 32,
                        position: 'relative',
                      }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
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

      {/* Day editor (single / range) */}
      {editingDay && (
        <Sheet open={!!editingDay} onClose={() => setEditingDay(null)} title={mode === 'single' ? `${editingDay}` : 'Несколько дней'}>
          {/* Переключатель single / range */}
          <div className="segmented" style={{ marginBottom: 16, display: 'flex', width: '100%' }}>
            <button
              className={`segmented-item ${mode === 'single' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setMode('single')}
            >
              Один день
            </button>
            <button
              className={`segmented-item ${mode === 'range' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setMode('range')}
            >
              Промежуток / несколько
            </button>
          </div>

          {/* Range pickers */}
          {mode === 'range' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label className="input-label">С</label>
                  <input
                    type="date"
                    className="input-field"
                    value={rangeStart}
                    onChange={(e) => setRangeStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="input-label">По</label>
                  <input
                    type="date"
                    className="input-field"
                    value={rangeEnd}
                    onChange={(e) => setRangeEnd(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setRangeStart(editingDay); setRangeEnd(addDays(editingDay, 6)); }}>+ неделя</button>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setRangeStart(editingDay); setRangeEnd(addDays(editingDay, 13)); }}>+ 2 недели</button>
                <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => {
                  const d = new Date(editingDay);
                  const lastDay = daysInMonth(d.getFullYear(), d.getMonth());
                  setRangeStart(editingDay);
                  setRangeEnd(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`);
                }}>до конца месяца</button>
              </div>
              {rangeCount > 0 && (
                <div style={{ marginTop: 10, padding: 10, background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                  Будет применено к {rangeCount} {rangeCount === 1 ? 'дню' : rangeCount < 5 ? 'дням' : 'дням'}
                </div>
              )}
            </div>
          )}

          {/* Current types indicator (только для single) */}
          {mode === 'single' && currentDay && currentDay.types.length > 0 && (
            <div style={{ marginBottom: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {currentDay.types.map(t => (
                <span key={t} className="badge" style={{ background: DAY_TYPE_META[t].bg, color: DAY_TYPE_META[t].color }}>
                  {DAY_TYPE_META[t].label} ✓
                </span>
              ))}
            </div>
          )}

          {/* Type list */}
          <label className="input-label" style={{ marginBottom: 8 }}>
            {mode === 'single' ? 'Тип дня (можно несколько — тап = вкл/выкл)' : 'Выбери тип — применится ко всем дням промежутка'}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {Object.entries(DAY_TYPE_META).map(([k, m]) => {
              const active = mode === 'single' && currentDay?.types.includes(k as DayType);
              return (
                <button
                  key={k}
                  className="list-item"
                  style={{
                    border: 'none', width: '100%',
                    background: active ? m.bg : 'var(--bg-card)',
                    textAlign: 'left', cursor: 'pointer', borderRadius: 8,
                    color: active ? m.color : 'var(--text-primary)',
                    fontWeight: active ? 700 : 500,
                  }}
                  onClick={() => onTypeClick(k as DayType)}
                >
                  <span style={{ flex: 1 }}>{m.label}</span>
                  {active && <span>✓</span>}
                  {mode === 'range' && <span style={{ color: 'var(--text-tertiary)', fontSize: 18 }}>→</span>}
                </button>
              );
            })}
          </div>

          {/* Clear button */}
          <button
            className="btn-secondary"
            style={{ width: '100%', color: '#991B1B', marginBottom: 16 }}
            onClick={onClear}
          >
            {mode === 'single' ? 'Очистить типы у этого дня' : `Очистить типы у ${rangeCount} дней`}
          </button>

          {/* Description — only for single */}
          {mode === 'single' && (
            <div>
              <label className="input-label">Описание</label>
              <textarea
                className="input-field"
                placeholder="Что запланировано на этот день?"
                value={currentDay?.note || ''}
                onChange={(e) => updateNote(editingDay, e.target.value)}
                rows={3}
              />
            </div>
          )}
        </Sheet>
      )}
    </div>
  );
}
