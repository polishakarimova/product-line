'use client';

import { useStore } from '@/lib/store';
import { useEffect } from 'react';

const THEMES: { id: 'light' | 'dark' | 'pastel'; label: string; emoji: string }[] = [
  { id: 'light', label: 'Светлая', emoji: '☀' },
  { id: 'dark', label: 'Тёмная', emoji: '☾' },
  { id: 'pastel', label: 'Лиловая', emoji: '✦' },
];

export function ThemePill() {
  const theme = useStore(s => s.theme);
  const setTheme = useStore(s => s.setTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
  }, [theme]);

  return (
    <div className="theme-pill">
      {THEMES.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className={`theme-btn ${theme === t.id ? 'active' : ''}`}
          aria-label={t.label}
        >
          <span>{t.emoji}</span>
        </button>
      ))}
    </div>
  );
}
