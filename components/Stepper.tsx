'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { STEPS } from '@/lib/steps';
import { useStore } from '@/lib/store';
import { progressByStep } from '@/lib/formulas';
import { useMemo } from 'react';

export function Stepper() {
  const pathname = usePathname();
  const state = useStore();
  const progress = useMemo(() => progressByStep(state), [state]);
  const progressMap: Record<string, number> = {
    'step-1': progress.step1,
    'step-2': progress.step2,
    'step-3': progress.step3,
    'step-4': progress.step4,
    'step-5': progress.step5,
    'step-6': progress.step6,
  };

  return (
    <nav className="stepper">
      <div className="stepper-track">
        <Link
          href="/"
          className={`stepper-item ${pathname === '/' ? 'active' : ''}`}
          aria-label="Обзор"
        >
          <span style={{ fontSize: 16 }}>🏠</span>
          <span>Обзор</span>
        </Link>
        {STEPS.map(step => {
          const isActive = pathname.startsWith('/' + step.id);
          const isDone = progressMap[step.id] >= 1;
          return (
            <Link
              key={step.id}
              href={step.href}
              className={`stepper-item ${isActive ? 'active' : ''} ${!isActive && isDone ? 'done' : ''}`}
            >
              <span className="stepper-num"><span>{isDone && !isActive ? '✓' : step.num}</span></span>
              <span>{step.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
