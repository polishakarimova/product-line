'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { exportJSON, exportXLSX, importJSON } from '@/lib/exporter';

export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const state = useStore();
  const importState = useStore(s => s.importState);
  const resetState = useStore(s => s.resetState);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const onImport = async (file: File) => {
    try {
      const data = await importJSON(file);
      importState(data);
      alert('Импортировано ✓');
    } catch (e) {
      alert('Ошибка импорта: ' + String(e));
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="btn-secondary" onClick={() => setOpen(o => !o)}>
        <span>⤓</span> Экспорт / импорт
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 100,
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
          minWidth: 240, padding: 8, display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <button className="btn-ghost" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => { exportJSON(state); setOpen(false); }}>
            <span>↓</span> Скачать JSON (для обмена)
          </button>
          <button className="btn-ghost" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => { exportXLSX(state); setOpen(false); }}>
            <span>↓</span> Скачать Excel (xlsx)
          </button>
          <button className="btn-ghost" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => fileRef.current?.click()}>
            <span>↑</span> Импорт из JSON
          </button>
          <div style={{ height: 1, background: 'var(--border-soft)', margin: '4px 0' }} />
          <button
            className="btn-ghost"
            style={{ justifyContent: 'flex-start', width: '100%', color: '#991B1B' }}
            onClick={() => {
              if (confirm('Сбросить все данные? Отменить нельзя.')) { resetState(); setOpen(false); }
            }}
          >
            <span>🗑</span> Сбросить всё
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { onImport(f); setOpen(false); }
            }}
          />
        </div>
      )}
    </div>
  );
}
