// client/src/components/CMS.jsx
// Full CMS UI — 8 pages, i18n (ar/en), wired to live API data via props from App.jsx
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { translations, GRADE_KEYS } from '../i18n';

// ── Design tokens ───────────────────────────────────────────────
const C = {
  navy: '#0D2137', navyLight: '#16314F', teal: '#0A7E8C', gold: '#D4A017',
  red: '#8C1A1A', green: '#1A7A4A', blue: '#1A4A7A', purple: '#6B3FA0',
  orange: '#D4700A', bg: '#F0F4F8', card: '#FFFFFF', border: '#E2EBF3',
  textMuted: '#8FA8C0', textDark: '#16314F',
};
const FONT = 'Cairo,sans-serif';
const MONO = 'Space Mono,monospace';

const STATUS_KEYS = ['لم يبدأ', 'جارٍ', 'في المراجعة', 'مكتمل'];
const STATUS_COLOR = {
  'لم يبدأ': C.textMuted, 'جارٍ': C.blue, 'في المراجعة': C.orange, 'مكتمل': C.green,
};
const PRIORITY_KEYS = ['منخفضة', 'متوسطة', 'عالية'];
const PRIORITY_COLOR = { 'منخفضة': C.green, 'متوسطة': C.orange, 'عالية': C.red };
const GATE_KEYS = ['لم يفتح', 'معلق', 'اجتاز', 'مرفوض'];
const GATE_COLOR = { 'لم يفتح': C.textMuted, 'معلق': C.orange, 'اجتاز': C.green, 'مرفوض': C.red };
const ROLE_OPTIONS = ['viewer', 'author', 'reviewer', 'designer', 'coordinator', 'editor', 'admin'];

// ── Small shared UI bits ────────────────────────────────────────
function Badge({ text, color }) {
  return (
    <span style={{
      background: `${color}1A`, color, fontWeight: 700, fontSize: 11,
      padding: '4px 10px', borderRadius: 999, display: 'inline-block', whiteSpace: 'nowrap',
    }}>{text}</span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
      boxShadow: '0 1px 4px rgba(13,33,55,.06)', ...style,
    }}>{children}</div>
  );
}

function ProgressBar({ value, color = C.teal, h = 8 }) {
  return (
    <div style={{ background: '#E2EBF3', borderRadius: 999, height: h, overflow: 'hidden' }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, value))}%`, height: '100%',
        background: color, borderRadius: 999, transition: 'width .3s ease',
      }} />
    </div>
  );
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(13,33,55,.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, borderRadius: 16, width: '100%', maxWidth: width,
        maxHeight: '88vh', overflowY: 'auto', padding: 24, fontFamily: FONT,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.textDark }}>{title}</div>
          <button onClick={onClose} style={{
            background: '#F0F4F8', border: 'none', borderRadius: 8, width: 30, height: 30,
            cursor: 'pointer', fontSize: 14, color: C.textMuted,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 9,
  border: `1px solid ${C.border}`, fontFamily: FONT, fontSize: 13, outline: 'none',
  background: '#FAFCFE', color: C.textDark,
};

function Btn({ children, onClick, variant = 'primary', style, type = 'button', disabled }) {
  const styles = {
    primary:  { background: C.teal, color: 'white' },
    danger:   { background: C.red, color: 'white' },
    ghost:    { background: 'rgba(255,255,255,.1)', color: 'white' },
    outline:  { background: 'white', color: C.teal, border: `1px solid ${C.teal}` },
    subtle:   { background: '#F0F4F8', color: C.textDark },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      border: 'none', borderRadius: 9, padding: '9px 16px', fontFamily: FONT,
      fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .6 : 1, ...styles[variant], ...style,
    }}>{children}</button>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ padding: '48px 20px', textAlign: 'center', color: C.textMuted }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

// ── Topbar + sidebar shell ──────────────────────────────────────
function Shell({ page, setPage, totalProg, user, onLogout, onRefresh, lang, setLang, t, navList, children }) {
  return (
    <div style={{ fontFamily: FONT, direction: t.dir, minHeight: '100vh', background: C.bg, display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: C.navy, minHeight: '100vh', display: 'flex',
        flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{ padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ width: 34, height: 34, background: C.gold, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📚</div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>{t.appName}</div>
            <div style={{ color: C.textMuted, fontSize: 10 }}>{t.appSubtitle}</div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navList.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: t.dir === 'rtl' ? 'right' : 'left',
              fontFamily: FONT, fontSize: 13, fontWeight: 700,
              background: page === n.id ? 'rgba(255,255,255,.1)' : 'transparent',
              color: page === n.id ? 'white' : C.textMuted,
            }}>
              <span style={{ fontSize: 15 }}>{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
        <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,.08)' }}>
          {/* Language switch */}
          <div style={{ display: 'flex', borderRadius: 9, overflow: 'hidden', marginBottom: 10, border: '1px solid rgba(255,255,255,.15)' }}>
            {['ar', 'en'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                flex: 1, padding: '7px 0', border: 'none', cursor: 'pointer', fontFamily: FONT,
                fontSize: 12, fontWeight: 700,
                background: lang === l ? C.teal : 'transparent',
                color: lang === l ? 'white' : C.textMuted,
              }}>{l === 'ar' ? 'العربية' : 'English'}</button>
            ))}
          </div>
          <div style={{ background: C.teal, color: 'white', borderRadius: 9, padding: '8px 12px', fontSize: 11, fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>
            {t.totalProgress}: {totalProg}%
          </div>
          <Btn variant="ghost" onClick={onLogout} style={{ width: '100%' }}>{t.logout}</Btn>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: 'white', borderBottom: `1px solid ${C.border}`, padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.textDark }}>
            {navList.find(n => n.id === page)?.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: C.textMuted, fontSize: 12 }}>{t.welcome}, {user?.name}</div>
            <Btn variant="subtle" onClick={onRefresh}>🔄 {t.refresh}</Btn>
          </div>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Dashboard page ───────────────────────────────────────────────
function DashboardPage({ data, totalProg, t, lang }) {
  const { tasks, members, phases, phaseProgress, activity } = data;
  const doneTasks = tasks.filter(x => x.status === 'مكتمل').length;
  const activeTasks = tasks.filter(x => x.status === 'جارٍ').length;
  const overdue = tasks.filter(x => x.due_date && x.status !== 'مكتمل' && new Date(x.due_date) < new Date()).length;

  const phaseChartData = phases.map(p => ({
    name: p.name, progress: phaseProgress[p.id] ?? p.progress ?? 0, color: p.color || C.teal,
  }));

  const statusPie = STATUS_KEYS.map(s => ({
    name: t.status[s], value: tasks.filter(x => x.status === s).length, color: STATUS_COLOR[s],
  })).filter(d => d.value > 0);

  const upcoming = tasks
    .filter(x => x.status !== 'مكتمل' && x.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { l: t.dashboard.totalProgress, v: `${totalProg}%`, c: C.teal },
          { l: t.dashboard.completedTasks, v: `${doneTasks}/${tasks.length}`, c: C.green },
          { l: t.dashboard.activeTasks, v: activeTasks, c: C.blue },
          { l: t.dashboard.overdueTasks, v: overdue, c: overdue > 0 ? C.red : C.textMuted },
          { l: t.dashboard.teamMembers, v: members.length, c: C.purple },
        ].map(k => (
          <Card key={k.l} style={{ padding: '18px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>{k.l}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: k.c, fontFamily: MONO }}>{k.v}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark, marginBottom: 14 }}>{t.dashboard.phaseProgress}</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={phaseChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2EBF3" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: FONT }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="progress" radius={[6, 6, 0, 0]}>
                {phaseChartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark, marginBottom: 14 }}>{t.dashboard.taskStatusDist}</div>
          {statusPie.length === 0 ? <EmptyState icon="📭" text={t.dashboard.noTasks} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={{ fontSize: 11, fontFamily: FONT }}>
                  {statusPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: FONT }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark, marginBottom: 14 }}>{t.dashboard.upcomingDeadlines}</div>
          {upcoming.length === 0 ? <EmptyState icon="🗓️" text={t.dashboard.noDeadlines} /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map(x => (
                <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 13, color: C.textDark, fontWeight: 600 }}>{x.title}</div>
                  <Badge text={x.due_date} color={new Date(x.due_date) < new Date() ? C.red : C.textMuted} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark, marginBottom: 14 }}>{t.dashboard.recentActivity}</div>
          {activity.length === 0 ? <EmptyState icon="🕓" text={t.dashboard.noActivity} /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
              {activity.slice(0, 6).map(a => (
                <div key={a.id} style={{ fontSize: 12.5, color: C.textDark, lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: a.text }} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Tasks page ────────────────────────────────────────────────────
function TaskForm({ initial, members, phases, t, lang, onSave, onCancel }) {
  const [f, setF] = useState(initial || {
    title: '', description: '', phase_id: phases[0]?.id || '', assignee_id: '',
    status: 'لم يبدأ', progress: 0, priority: 'متوسطة', due_date: '', notes: '', grade_year: '',
  });
  return (
    <div>
      <Field label={t.tasks.formTitle}>
        <input style={inputStyle} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
      </Field>
      <Field label={t.tasks.formDesc}>
        <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={f.description}
          onChange={e => setF({ ...f, description: e.target.value })} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={t.tasks.formPhase}>
          <select style={inputStyle} value={f.phase_id} onChange={e => setF({ ...f, phase_id: e.target.value })}>
            {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label={t.tasks.formAssignee}>
          <select style={inputStyle} value={f.assignee_id || ''} onChange={e => setF({ ...f, assignee_id: e.target.value })}>
            <option value="">{t.tasks.formNoAssignee}</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name_ar || m.name}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={t.tasks.formStatus}>
          <select style={inputStyle} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>
            {STATUS_KEYS.map(s => <option key={s} value={s}>{t.status[s]}</option>)}
          </select>
        </Field>
        <Field label={t.tasks.formPriority}>
          <select style={inputStyle} value={f.priority} onChange={e => setF({ ...f, priority: e.target.value })}>
            {PRIORITY_KEYS.map(p => <option key={p} value={p}>{t.priority[p]}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={`${t.tasks.formProgress} (${f.progress}%)`}>
          <input type="range" min={0} max={100} value={f.progress}
            onChange={e => setF({ ...f, progress: +e.target.value })} style={{ width: '100%' }} />
        </Field>
        <Field label={t.tasks.formDue}>
          <input type="date" style={inputStyle} value={f.due_date || ''} onChange={e => setF({ ...f, due_date: e.target.value })} />
        </Field>
      </div>
      <Field label={t.tasks.formYear}>
        <select style={inputStyle} value={f.grade_year || ''} onChange={e => setF({ ...f, grade_year: e.target.value })}>
          <option value="">{t.tasks.formNoYear}</option>
          {GRADE_KEYS.map(g => <option key={g} value={g}>{translations[lang]?.grades?.[g] || g}</option>)}
        </select>
      </Field>
      <Field label={t.tasks.formNotes}>
        <textarea style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} value={f.notes}
          onChange={e => setF({ ...f, notes: e.target.value })} />
      </Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <Btn onClick={() => onSave(f)} style={{ flex: 1 }}>{t.save}</Btn>
        <Btn variant="subtle" onClick={onCancel} style={{ flex: 1 }}>{t.cancel}</Btn>
      </div>
    </div>
  );
}

function TasksPage({ data, onAddTask, onUpdateTask, onDeleteTask, t, lang }) {
  const { tasks, members, phases } = data;
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | task object

  const memberName = id => members.find(m => m.id === id)?.name_ar || members.find(m => m.id === id)?.name || '—';
  const phaseName = id => phases.find(p => p.id === id)?.name || id;
  const depts = useMemo(() => [...new Set(members.map(m => m.dept_en).filter(Boolean))], [members]);
  const deptOf = id => members.find(m => m.id === id)?.dept_en;

  const filtered = useMemo(() => tasks.filter(x =>
    (!filterStatus || x.status === filterStatus) &&
    (!filterPhase || x.phase_id === filterPhase) &&
    (!filterYear || x.grade_year === filterYear) &&
    (!filterDept || deptOf(x.assignee_id) === filterDept) &&
    (!search || x.title.toLowerCase().includes(search.toLowerCase()))
  ), [tasks, filterStatus, filterPhase, filterYear, filterDept, search, members]);

  const handleSave = async f => {
    if (f.id) await onUpdateTask(f); else await onAddTask(f);
    setModal(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder={t.tasks.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: 200 }} />
        <select style={{ ...inputStyle, width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">{t.tasks.allStatuses}</option>
          {STATUS_KEYS.map(s => <option key={s} value={s}>{t.status[s]}</option>)}
        </select>
        <select style={{ ...inputStyle, width: 160 }} value={filterPhase} onChange={e => setFilterPhase(e.target.value)}>
          <option value="">{t.tasks.allPhases}</option>
          {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select style={{ ...inputStyle, width: 160 }} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="">{t.tasks.allYears}</option>
          {GRADE_KEYS.map(g => <option key={g} value={g}>{translations[lang]?.grades?.[g] || g}</option>)}
        </select>
        {depts.length > 0 && (
          <select style={{ ...inputStyle, width: 170 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">{t.tasks.allDepts}</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <div style={{ flex: 1 }} />
        <Btn onClick={() => setModal('new')}>+ {t.tasks.newTask}</Btn>
      </div>

      <Card>
        {filtered.length === 0 ? <EmptyState icon="✅" text={t.tasks.noTasks} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}`, textAlign: t.dir === 'rtl' ? 'right' : 'left' }}>
                  {[t.tasks.colTask, t.tasks.colPhase, t.tasks.colYear, t.tasks.colAssignee, t.tasks.colStatus,
                    t.tasks.colPriority, t.tasks.colProgress, t.tasks.colDue, ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', color: C.textMuted, fontSize: 11, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(x => (
                  <tr key={x.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: C.textDark }}>{x.title}</td>
                    <td style={{ padding: '10px 14px', color: C.textMuted }}>{phaseName(x.phase_id)}</td>
                    <td style={{ padding: '10px 14px', color: C.textMuted }}>
                      {x.grade_year ? (translations[lang]?.grades?.[x.grade_year] || x.grade_year) : '—'}
                    </td>
                    <td style={{ padding: '10px 14px', color: C.textMuted }}>{memberName(x.assignee_id)}</td>
                    <td style={{ padding: '10px 14px' }}><Badge text={t.status[x.status] || x.status} color={STATUS_COLOR[x.status]} /></td>
                    <td style={{ padding: '10px 14px' }}><Badge text={t.priority[x.priority] || x.priority} color={PRIORITY_COLOR[x.priority]} /></td>
                    <td style={{ padding: '10px 14px', minWidth: 110 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ProgressBar value={x.progress} />
                        <span style={{ fontSize: 11, color: C.textMuted, fontFamily: MONO }}>{x.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: x.due_date && new Date(x.due_date) < new Date() && x.status !== 'مكتمل' ? C.red : C.textMuted, fontSize: 12 }}>
                      {x.due_date || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setModal(x)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginInlineEnd: 8 }}>✏️</button>
                      <button onClick={() => onDeleteTask(x.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={modal === 'new' ? t.tasks.newTask : t.tasks.editTask} onClose={() => setModal(null)}>
          <TaskForm initial={modal === 'new' ? null : modal} members={members} phases={phases} t={t} lang={lang}
            onSave={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

// ── Members page ─────────────────────────────────────────────────
function MemberForm({ initial, t, onSave, onCancel }) {
  const [f, setF] = useState(initial || {
    name: '', name_ar: '', role_id: '', email: '', phone: '', job_en: '', job_ar: '', notes: '',
    dept_en: '', dept_ar: '', section_en: '', section_ar: '',
  });
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={t.members.formNameEn}><input style={inputStyle} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></Field>
        <Field label={t.members.formNameAr}><input style={inputStyle} value={f.name_ar || ''} onChange={e => setF({ ...f, name_ar: e.target.value })} /></Field>
      </div>
      <Field label={t.members.formRole}><input style={inputStyle} value={f.role_id} onChange={e => setF({ ...f, role_id: e.target.value })} placeholder="r_editor" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={t.members.formEmail}><input style={inputStyle} value={f.email || ''} onChange={e => setF({ ...f, email: e.target.value })} /></Field>
        <Field label={t.members.formPhone}><input style={inputStyle} value={f.phone || ''} onChange={e => setF({ ...f, phone: e.target.value })} /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={t.members.formJobEn}><input style={inputStyle} value={f.job_en || ''} onChange={e => setF({ ...f, job_en: e.target.value })} /></Field>
        <Field label={t.members.formJobAr}><input style={inputStyle} value={f.job_ar || ''} onChange={e => setF({ ...f, job_ar: e.target.value })} /></Field>
      </div>
      {/* Group / Department assignment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label={t.members.formDept}><input style={inputStyle} value={f.dept_en || ''} onChange={e => setF({ ...f, dept_en: e.target.value })} placeholder={t.members.formDeptPlaceholder} /></Field>
        <Field label={t.members.formSection}><input style={inputStyle} value={f.section_en || ''} onChange={e => setF({ ...f, section_en: e.target.value })} placeholder={t.members.formSectionPlaceholder} /></Field>
      </div>
      <Field label={t.members.formNotes}><textarea style={{ ...inputStyle, minHeight: 50 }} value={f.notes || ''} onChange={e => setF({ ...f, notes: e.target.value })} /></Field>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <Btn onClick={() => onSave(f)} style={{ flex: 1 }}>{t.save}</Btn>
        <Btn variant="subtle" onClick={onCancel} style={{ flex: 1 }}>{t.cancel}</Btn>
      </div>
    </div>
  );
}

function MembersPage({ data, onAddMember, onUpdateMember, t }) {
  const { members, tasks } = data;
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modal, setModal] = useState(null);

  const depts = useMemo(() => [...new Set(members.map(m => m.dept_en).filter(Boolean))], [members]);

  const filtered = useMemo(() => members.filter(m =>
    (!deptFilter || m.dept_en === deptFilter) &&
    (!search || (m.name + m.name_ar + (m.jc || '')).toLowerCase().includes(search.toLowerCase()))
  ), [members, search, deptFilter]);

  const handleSave = async f => {
    if (f.id) await onUpdateMember(f); else await onAddMember(f);
    setModal(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder={t.members.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, width: 220 }} />
        {depts.length > 0 && (
          <select style={{ ...inputStyle, width: 220 }} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="">{t.members.allDepts}</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        )}
        <div style={{ flex: 1 }} />
        <Btn onClick={() => setModal('new')}>+ {t.members.newMember}</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {filtered.length === 0 ? <EmptyState icon="👥" text={t.members.noMembers} /> : filtered.map(m => {
          const taskCount = tasks.filter(x => x.assignee_id === m.id).length;
          const doneCount = tasks.filter(x => x.assignee_id === m.id && x.status === 'مكتمل').length;
          return (
            <Card key={m.id} style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark }}>{m.name_ar || m.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{m.job_ar || m.job_en || '—'}</div>
                </div>
                <button onClick={() => setModal(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✏️</button>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {m.dept_ar && <Badge text={m.dept_ar} color={C.purple} />}
                {m.section_ar && <Badge text={m.section_ar} color={C.blue} />}
                {m.role_id && <Badge text={m.role_id} color={C.teal} />}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: C.textMuted }}>
                {t.members.tasksLabel}: {doneCount}/{taskCount} {t.members.completed}
              </div>
              {taskCount > 0 && <div style={{ marginTop: 6 }}><ProgressBar value={taskCount ? (doneCount / taskCount) * 100 : 0} color={C.green} h={6} /></div>}
            </Card>
          );
        })}
      </div>

      {modal && (
        <Modal title={modal === 'new' ? t.members.newMember : t.members.editMember} onClose={() => setModal(null)}>
          <MemberForm initial={modal === 'new' ? null : modal} t={t} onSave={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

// ── Phases page ───────────────────────────────────────────────────
function PhasesPage({ data, onUpdatePhaseProgress, t }) {
  const { phases, phaseProgress, tasks } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {phases.map(p => {
        const prog = phaseProgress[p.id] ?? p.progress ?? 0;
        const phaseTasks = tasks.filter(x => x.phase_id === p.id);
        return (
          <Card key={p.id} style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 22 }}>{p.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.textDark }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{p.name_en} · {p.weeks}</div>
                </div>
              </div>
              <div style={{ fontFamily: MONO, fontWeight: 900, fontSize: 22, color: p.color || C.teal }}>{prog}%</div>
            </div>
            <ProgressBar value={prog} color={p.color || C.teal} h={10} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <input type="range" min={0} max={100} value={prog} style={{ flex: 1 }}
                onChange={e => onUpdatePhaseProgress(p.id, +e.target.value)} />
              <div style={{ fontSize: 12, color: C.textMuted }}>{phaseTasks.length} {t.phases.taskCount}</div>
            </div>
          </Card>
        );
      })}
      {phases.length === 0 && <EmptyState icon="🗂️" text={t.phases.noPhases} />}
    </div>
  );
}

// ── Gates page ────────────────────────────────────────────────────
function GatesPage({ data, onUpdateGate, t }) {
  const { gates, phases } = data;
  const phaseName = id => phases.find(p => p.id === id)?.name || id;
  const gateList = Object.values(gates);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
      {gateList.length === 0 ? <EmptyState icon="🚦" text={t.gates.noGates} /> : gateList.map(g => (
        <Card key={g.id} style={{ padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.textDark }}>{g.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{phaseName(g.phase_id)}</div>
            </div>
            <Badge text={t.gateStatus[g.status] || g.status} color={GATE_COLOR[g.status] || C.textMuted} />
          </div>
          {g.approved_date && <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>{t.gates.approvedOn}: {g.approved_date}</div>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {GATE_KEYS.map(s => (
              <button key={s} onClick={() => onUpdateGate(g.id, {
                status: s,
                approved_date: s === 'اجتاز' ? new Date().toISOString().split('T')[0] : g.approved_date,
              })} style={{
                fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999,
                border: `1px solid ${GATE_COLOR[s]}`, background: g.status === s ? GATE_COLOR[s] : 'white',
                color: g.status === s ? 'white' : GATE_COLOR[s], cursor: 'pointer', fontFamily: FONT,
              }}>{t.gateStatus[s]}</button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ── Activity page ─────────────────────────────────────────────────
function ActivityPage({ data, onAddActivity, t }) {
  const { activity } = data;
  const [text, setText] = useState('');

  const submit = async () => {
    if (!text.trim()) return;
    await onAddActivity({ text: text.trim(), type: 'info' });
    setText('');
  };

  const typeColor = { info: C.blue, success: C.green, warning: C.orange, error: C.red };

  return (
    <div>
      <Card style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 10 }}>
        <input style={{ ...inputStyle, flex: 1 }} placeholder={t.activityPage.addPlaceholder} value={text}
          onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        <Btn onClick={submit}>{t.add}</Btn>
      </Card>
      <Card style={{ padding: 4 }}>
        {activity.length === 0 ? <EmptyState icon="🕓" text={t.activityPage.noActivity} /> : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activity.map(a => (
              <div key={a.id} style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColor[a.type] || C.textMuted, marginTop: 6, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.textDark, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{a.created_at}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Users page (admin only) ────────────────────────────────────────
function UserForm({ initial, t, onSave, onCancel }) {
  const isEdit = !!initial;
  const [f, setF] = useState(initial || { username: '', password: '', name: '', email: '', role: 'viewer' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr(''); setBusy(true);
    const res = await onSave(f);
    setBusy(false);
    if (!res?.ok) setErr(res?.error || 'error');
  };

  return (
    <div>
      <Field label={t.users.formUsername}>
        <input style={inputStyle} value={f.username} disabled={isEdit}
          onChange={e => setF({ ...f, username: e.target.value })} />
      </Field>
      <Field label={isEdit ? t.users.formPasswordEdit : t.users.formPassword}>
        <input type="password" style={inputStyle} value={f.password || ''}
          onChange={e => setF({ ...f, password: e.target.value })} />
      </Field>
      <Field label={t.users.formName}>
        <input style={inputStyle} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
      </Field>
      <Field label={t.users.formEmail}>
        <input style={inputStyle} value={f.email || ''} onChange={e => setF({ ...f, email: e.target.value })} />
      </Field>
      <Field label={t.users.formRole}>
        <select style={inputStyle} value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>
          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </Field>
      {err && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{t.users.errorPrefix} {err}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <Btn onClick={submit} disabled={busy} style={{ flex: 1 }}>{t.save}</Btn>
        <Btn variant="subtle" onClick={onCancel} style={{ flex: 1 }}>{t.cancel}</Btn>
      </div>
    </div>
  );
}

function UsersPage({ data, user, onAddUser, onUpdateUser, onDeleteUser, t }) {
  const isAdmin = user?.role === 'admin';
  const [modal, setModal] = useState(null);

  if (!isAdmin) {
    return <EmptyState icon="🔒" text={t.users.adminOnly} />;
  }

  const users = data.users || [];

  const handleSave = async f => {
    const res = f.id ? await onUpdateUser(f) : await onAddUser(f);
    if (res?.ok) setModal(null);
    return res;
  };

  const handleDeactivate = async u => {
    if (u.id === user.id) { alert(t.users.cannotDeleteSelf); return; }
    await onDeleteUser(u.id);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Btn onClick={() => setModal('new')}>+ {t.users.newUser}</Btn>
      </div>
      <Card>
        {users.length === 0 ? <EmptyState icon="👤" text={t.users.noUsers} /> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}`, textAlign: t.dir === 'rtl' ? 'right' : 'left' }}>
                  {[t.users.colUsername, t.users.colName, t.users.colEmail, t.users.colRole, t.users.colStatus, ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', color: C.textMuted, fontSize: 11, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: C.textDark, fontFamily: MONO }}>{u.username}</td>
                    <td style={{ padding: '10px 14px', color: C.textDark }}>{u.name}</td>
                    <td style={{ padding: '10px 14px', color: C.textMuted }}>{u.email || '—'}</td>
                    <td style={{ padding: '10px 14px' }}><Badge text={u.role} color={C.purple} /></td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge text={u.is_active ? t.users.active : t.users.inactive} color={u.is_active ? C.green : C.textMuted} />
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => setModal(u)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginInlineEnd: 8 }}>✏️</button>
                      {u.is_active ? (
                        <button onClick={() => handleDeactivate(u)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>🚫</button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modal && (
        <Modal title={modal === 'new' ? t.users.newUser : t.users.editUser} onClose={() => setModal(null)}>
          <UserForm initial={modal === 'new' ? null : modal} t={t} onSave={handleSave} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}

// ── Settings page ─────────────────────────────────────────────────
function SettingsPage({ user, lang, setLang, t }) {
  return (
    <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card style={{ padding: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.textDark, marginBottom: 16 }}>{t.settings.title}</div>
        <Field label={t.settings.name}><input style={inputStyle} value={user?.name || ''} disabled /></Field>
        <Field label={t.settings.username}><input style={inputStyle} value={user?.username || ''} disabled /></Field>
        <Field label={t.settings.role}><input style={inputStyle} value={user?.role || ''} disabled /></Field>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 10 }}>{t.settings.passwordNote}</div>
      </Card>
      <Card style={{ padding: 22 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: C.textDark, marginBottom: 6 }}>{t.settings.language}</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 14 }}>{t.settings.languageNote}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['ar', 'en'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              flex: 1, padding: '10px 0', borderRadius: 9, cursor: 'pointer', fontFamily: FONT,
              fontSize: 13, fontWeight: 700, border: `1px solid ${lang === l ? C.teal : C.border}`,
              background: lang === l ? C.teal : 'white', color: lang === l ? 'white' : C.textDark,
            }}>{l === 'ar' ? 'العربية' : 'English'}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────
export default function CMS({ data, user, onLogout, onRefresh,
  onUpdateTask, onAddTask, onDeleteTask,
  onAddMember, onUpdateMember,
  onUpdatePhaseProgress, onAddActivity, onUpdateGate,
  onAddUser, onUpdateUser, onDeleteUser }) {

  const [page, setPage] = useState('dashboard');
  const [lang, setLang] = useState(() => localStorage.getItem('cms_lang') || 'ar');

  const setLangPersist = l => { setLang(l); try { localStorage.setItem('cms_lang', l); } catch (e) {} };

  const t = translations[lang] || translations.ar;

  const isAdmin = user?.role === 'admin';
  const navList = useMemo(() => {
    const base = [
      { id: 'dashboard', label: t.nav.dashboard, icon: '📊' },
      { id: 'tasks',      label: t.nav.tasks,      icon: '✅' },
      { id: 'members',    label: t.nav.members,    icon: '👥' },
      { id: 'phases',     label: t.nav.phases,     icon: '🗂️' },
      { id: 'gates',      label: t.nav.gates,      icon: '🚦' },
      { id: 'activity',   label: t.nav.activity,   icon: '🕓' },
      { id: 'settings',   label: t.nav.settings,   icon: '⚙️' },
    ];
    if (isAdmin) base.push({ id: 'users', label: t.nav.users, icon: '👤' });
    return base;
  }, [t, isAdmin]);

  const totalProg = useMemo(() => {
    const vals = Object.values(data.phaseProgress);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [data.phaseProgress]);

  return (
    <Shell page={page} setPage={setPage} totalProg={totalProg} user={user} onLogout={onLogout}
      onRefresh={onRefresh} lang={lang} setLang={setLangPersist} t={t} navList={navList}>
      {page === 'dashboard' && <DashboardPage data={data} totalProg={totalProg} t={t} lang={lang} />}
      {page === 'tasks' && (
        <TasksPage data={data} onAddTask={onAddTask} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} t={t} lang={lang} />
      )}
      {page === 'members' && (
        <MembersPage data={data} onAddMember={onAddMember} onUpdateMember={onUpdateMember} t={t} />
      )}
      {page === 'phases' && <PhasesPage data={data} onUpdatePhaseProgress={onUpdatePhaseProgress} t={t} />}
      {page === 'gates' && <GatesPage data={data} onUpdateGate={onUpdateGate} t={t} />}
      {page === 'activity' && <ActivityPage data={data} onAddActivity={onAddActivity} t={t} />}
      {page === 'users' && (
        <UsersPage data={data} user={user} onAddUser={onAddUser} onUpdateUser={onUpdateUser} onDeleteUser={onDeleteUser} t={t} />
      )}
      {page === 'settings' && <SettingsPage user={user} lang={lang} setLang={setLangPersist} t={t} />}
    </Shell>
  );
}
