'use client';

import { useStore } from '@/lib/store';
import { InfoHint } from '@/components/InfoHint';
import { SubTabs } from '@/components/SubTabs';
import { STEPS } from '@/lib/steps';
import { STEP_INTROS, INSTRUCTIONS } from '@/lib/instructions';

export default function TasksPage() {
  const tasks = useStore(s => s.tasks);
  const setTasks = useStore(s => s.setTasks);
  const intro = STEP_INTROS['step-6/tasks'];
  const subtabs = STEPS.find(s => s.id === 'step-6')!.children!;

  const addSubtask = (mIdx: number) => {
    setTasks(t => ({ ...t, months: t.months.map((m, i) => i === mIdx ? { ...m, subtasks: [...m.subtasks, { id: Math.random().toString(36).slice(2, 9), task: '', assignee: '' }] } : m) }));
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 24 }}>
        {tasks.months.map((m, mIdx) => (
          <div key={m.month} className="card" style={{ padding: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{m.month}</h3>
            <div style={{ marginBottom: 10 }}>
              <label className="input-label">Ключевая задача <InfoHint text={INSTRUCTIONS.keyTask} /></label>
              <input className="input-field" value={m.keyTask} onChange={e => setTasks(t => ({ ...t, months: t.months.map((mm, i) => i === mIdx ? { ...mm, keyTask: e.target.value } : mm) }))} placeholder="Главное, без чего не получится" />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="input-label">Кто выполняет</label>
              <input className="input-field" value={m.keyTaskAssignee} onChange={e => setTasks(t => ({ ...t, months: t.months.map((mm, i) => i === mIdx ? { ...mm, keyTaskAssignee: e.target.value } : mm) }))} placeholder="Имя или роль" />
            </div>
            <label className="input-label">Подзадачи <InfoHint text={INSTRUCTIONS.subtasks} /></label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {m.subtasks.map((s, sIdx) => (
                <div key={s.id} style={{ display: 'flex', gap: 4 }}>
                  <input
                    className="input-field"
                    style={{ flex: 1, fontSize: 13 }}
                    placeholder={`Подзадача ${sIdx + 1}`}
                    value={s.task}
                    onChange={e => setTasks(t => ({ ...t, months: t.months.map((mm, i) => i === mIdx ? { ...mm, subtasks: mm.subtasks.map(x => x.id === s.id ? { ...x, task: e.target.value } : x) } : mm) }))}
                  />
                  <input
                    className="input-field"
                    style={{ width: 90, fontSize: 13 }}
                    placeholder="Кто"
                    value={s.assignee}
                    onChange={e => setTasks(t => ({ ...t, months: t.months.map((mm, i) => i === mIdx ? { ...mm, subtasks: mm.subtasks.map(x => x.id === s.id ? { ...x, assignee: e.target.value } : x) } : mm) }))}
                  />
                  <button className="btn-icon" onClick={() => setTasks(t => ({ ...t, months: t.months.map((mm, i) => i === mIdx ? { ...mm, subtasks: mm.subtasks.filter(x => x.id !== s.id) } : mm) }))} aria-label="Удалить">✕</button>
                </div>
              ))}
            </div>
            <button className="btn-secondary" style={{ marginTop: 8, fontSize: 13 }} onClick={() => addSubtask(mIdx)}>+ Подзадача</button>
          </div>
        ))}
      </div>

      {/* Антикризис */}
      <div className="card" style={{ padding: 20, marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, flex: 1 }}>🛟 Антикризисные меры</h3>
          <InfoHint text={INSTRUCTIONS.crisis} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.crisis.map((c) => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: 8 }}>
              <input className="input-field" placeholder="Кризисная ситуация" value={c.situation} onChange={e => setTasks(t => ({ ...t, crisis: t.crisis.map(x => x.id === c.id ? { ...x, situation: e.target.value } : x) }))} />
              <input className="input-field" placeholder="Что предприму" value={c.response} onChange={e => setTasks(t => ({ ...t, crisis: t.crisis.map(x => x.id === c.id ? { ...x, response: e.target.value } : x) }))} />
              <button className="btn-icon" onClick={() => setTasks(t => ({ ...t, crisis: t.crisis.filter(x => x.id !== c.id) }))} aria-label="Удалить">✕</button>
            </div>
          ))}
        </div>
        <button className="btn-secondary" style={{ marginTop: 12 }} onClick={() => setTasks(t => ({ ...t, crisis: [...t.crisis, { id: Math.random().toString(36).slice(2, 9), situation: '', response: '' }] }))}>
          + Добавить меру
        </button>
      </div>
    </div>
  );
}
