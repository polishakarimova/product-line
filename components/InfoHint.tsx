'use client';

import { useState, useRef, useEffect } from 'react';

export function InfoHint({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<'top' | 'bottom'>('bottom');

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.bottom + 100 > window.innerHeight) setPos('top');
      else setPos('bottom');
    }
  }, [open]);

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        className="info-btn"
        aria-label="Пояснение"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(o => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        i
      </button>
      {open && (
        <span
          className="info-popover"
          role="tooltip"
          style={{
            [pos === 'bottom' ? 'top' : 'bottom']: '100%',
            marginTop: pos === 'bottom' ? 8 : 0,
            marginBottom: pos === 'top' ? 8 : 0,
            left: 0,
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
