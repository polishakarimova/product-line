'use client';

import { useStore } from '@/lib/store';
import { InfoHint } from '@/components/InfoHint';
import { SubTabs } from '@/components/SubTabs';
import { STEPS } from '@/lib/steps';
import { INSTRUCTIONS, STEP_INTROS } from '@/lib/instructions';

export default function AudiencePage() {
  const audience = useStore(s => s.audience);
  const setAudience = useStore(s => s.setAudience);
  const addAudienceGroup = useStore(s => s.addAudienceGroup);
  const intro = STEP_INTROS['step-3/audience'];
  const subtabs = STEPS.find(s => s.id === 'step-3')!.children!;

  const addQuote = (groupId: string) => {
    setAudience(a => a.map(g => g.id === groupId ? { ...g, quotes: [...g.quotes, ''] } : g));
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title">{intro.title}</h1>
          <p className="page-subtitle">{intro.hint}</p>
        </div>
      </div>
      <SubTabs items={subtabs} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
        {audience.map((group, idx) => (
          <div key={group.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 12 }}>
              <span className="badge badge-purple">Группа {idx + 1}</span>
              <InfoHint text={INSTRUCTIONS.audienceGroup} />
              <div style={{ flex: 1 }} />
              {audience.length > 1 && (
                <button
                  className="btn-icon"
                  onClick={() => setAudience(a => a.filter(g => g.id !== group.id))}
                  aria-label="Удалить"
                >✕</button>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="input-label">
                Обобщающая формулировка
                <InfoHint text={INSTRUCTIONS.audienceSummary} />
              </label>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Как одной фразой звучит главный вопрос этой группы? Например: «Как начать зарабатывать онлайн без опыта»"
                value={group.summary}
                onChange={(e) => setAudience(a => a.map(g => g.id === group.id ? { ...g, summary: e.target.value } : g))}
                style={{ fontSize: 16, fontWeight: 600 }}
              />
            </div>

            <div>
              <label className="input-label">
                Цитаты из ответов аудитории
                <InfoHint text={INSTRUCTIONS.audienceQuotes} />
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.quotes.map((q, qi) => (
                  <div key={qi} style={{ display: 'flex', gap: 6 }}>
                    <input
                      className="input-field"
                      style={{ flex: 1 }}
                      placeholder="Цитата из опроса..."
                      value={q}
                      onChange={(e) => setAudience(a => a.map(g => g.id === group.id ? {
                        ...g, quotes: g.quotes.map((x, i) => i === qi ? e.target.value : x)
                      } : g))}
                    />
                    <button
                      className="btn-icon"
                      onClick={() => setAudience(a => a.map(g => g.id === group.id ? {
                        ...g, quotes: g.quotes.filter((_, i) => i !== qi)
                      } : g))}
                      aria-label="Удалить"
                    >✕</button>
                  </div>
                ))}
              </div>
              <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => addQuote(group.id)}>
                + Добавить цитату
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={addAudienceGroup} style={{ marginBottom: 40 }}>
        + Добавить группу запросов
      </button>
    </div>
  );
}
