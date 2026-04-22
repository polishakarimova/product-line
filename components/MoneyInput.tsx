'use client';

import { useState, useEffect } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
  className?: string;
}

export function MoneyInput({ value, onChange, placeholder = '0', className = '' }: Props) {
  const [text, setText] = useState(value ? value.toString() : '');

  useEffect(() => {
    if (!isNaN(Number(text)) && Number(text) !== value) {
      setText(value ? value.toString() : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const format = (v: string) => {
    const clean = v.replace(/[^\d]/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('ru-RU').format(Number(clean));
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      className={`input-field input-money ${className}`}
      value={format(text)}
      placeholder={placeholder}
      onChange={(e) => {
        const clean = e.target.value.replace(/[^\d]/g, '');
        setText(clean);
        onChange(Number(clean) || 0);
      }}
    />
  );
}
