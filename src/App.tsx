import { useEffect, useMemo, useState } from 'react'
import { useStore } from './store'
import { PRIORITIES, type Priority, type Status, type Task } from './types'
import { cx, dueState } from './utils'
import Board from './components/Board'
import ListView from './components/ListView'
import TaskModal from './components/TaskModal'
import SettingsModal from './components/SettingsModal'
import { btnPrimary, inputCls } from './components/ui'

type View = 'board' | 'list'
type DueFilter = 'all' | 'overdue' | 'today' | 'week' | 'none'

export default function App({ onLock }: { onLock: () => void }) {
  const store = useStore()
  const [view, setView] = useState<View>(() => (localStorage.getItem('tasks-app:view') as View) || 'board')
  const [q, setQ] = useState('')
  const [prio, setPrio] = useState<Priority | 'all'>('all')
  const [label, setLabel] = useState<string>('all')
  const [due, setDue] = useState<DueFilter>('all')
  const [editing, setEditing] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<Status>('todo')
  const [settings, setSettings] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => { localStorage.setItem('tasks-app:view', view) }, [view])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('tasks-app:theme', dark ? 'dark' : 'light')
  }, [dark])

  // Keyboard shortcuts: "n" new task, "/" search, "b"/"l" switch view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, select, [role=dialog]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'n') { e.preventDefault(); openNew('todo') }
      if (e.key === '/') { e.preventDefault(); document.getElementById('search')?.focus() }
      if (e.key === 'b') setView('board')
      if (e.key === 'l') setView('list')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function openNew(s: Status) { setEditing(null); setNewStatus(s); setModalOpen(true) }
  function openEdit(t: Task) { setEditing(t); setModalOpen(true) }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return store.data.tasks.filter((t) => {
      if (needle && !(t.title.toLowerCase().includes(needle) || t.description.toLowerCase().includes(needle))) return false
      if (prio !== 'all' && t.priority !== prio) return false
      if (label !== 'all' && !t.labelIds.includes(label)) return false
      if (due !== 'all') {
        const s = dueState(t)
        if (due === 'overdue' && s !== 'overdue') return false
        if (due === 'today' && s !== 'today' && s !== 'overdue') return false
        if (due === 'week' && !(s === 'overdue' || s === 'today' || s === 'soon' || (t.dueDate && (new Date(t.dueDate).getTime() - Date.now()) / 86400000 <= 7 && t.status !== 'done'))) return false
        if (due === 'none' && t.dueDate) return false
      }
      return true
    })
  }, [store.data.tasks, q, prio, label, due])

  const stats = useMemo(() => {
    const open = store.data.tasks.filter((t) => t.status !== 'done')
    return { open: open.length, overdue: open.filter((t) => dueState(t) === 'overdue').length, done: store.data.tasks.length - open.length }
  }, [store.data.tasks])

  const filtersActive = q || prio !== 'all' || label !== 'all' || due !== 'all'
  const selectCls = 'rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500'

  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-7 w-7" />
            <span className="font-semibold text-lg">Tasks</span>
          </div>
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 text-sm">
            {(['board', 'list'] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cx('px-3 py-1 rounded-md capitalize transition', view === v ? 'bg-white dark:bg-slate-700 shadow-sm font-medium' : 'text-slate-500')}>{v}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-500">
            <span>{stats.open} open</span>
            {stats.overdue > 0 && <span className="text-rose-600 font-medium">{stats.overdue} overdue</span>}
            <span>{stats.done} done</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => openNew('todo')} className={btnPrimary} title="New task (N)">+ New task</button>
            <button onClick={() => setDark(!dark)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Toggle dark mode">
              {dark ? '☀︎' : '☾'}
            </button>
            <button onClick={() => setSettings(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Settings">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor"><path fillRule="evenodd" d="M11.5 1.9a1 1 0 0 0-1-.9h-1a1 1 0 0 0-1 .9l-.2 1.6a6.9 6.9 0 0 0-1.5.9l-1.5-.6a1 1 0 0 0-1.2.4l-.5.9a1 1 0 0 0 .2 1.3l1.3 1a7 7 0 0 0 0 1.8l-1.3 1a1 1 0 0 0-.2 1.3l.5.9a1 1 0 0 0 1.2.4l1.5-.6c.5.4 1 .7 1.5.9l.2 1.6a1 1 0 0 0 1 .9h1a1 1 0 0 0 1-.9l.2-1.6c.5-.2 1-.5 1.5-.9l1.5.6a1 1 0 0 0 1.2-.4l.5-.9a1 1 0 0 0-.2-1.3l-1.3-1a7 7 0 0 0 0-1.8l1.3-1a1 1 0 0 0 .2-1.3l-.5-.9a1 1 0 0 0-1.2-.4l-1.5.6a6.9 6.9 0 0 0-1.5-.9l-.2-1.6ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd"/></svg>
            </button>
            <button onClick={onLock} className="rounded-lg px-2 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Lock</button>
          </div>
        </div>
        <div className="mx-auto max-w-[1600px] px-4 pb-3 flex flex-wrap items-center gap-2">
          <input id="search" placeholder="Search tasks…  (/)" value={q} onChange={(e) => setQ(e.target.value)} className={inputCls.replace('w-full', 'w-full sm:w-64') + ' py-1.5'} />
          <select value={prio} onChange={(e) => setPrio(e.target.value as Priority | 'all')} className={selectCls} aria-label="Priority filter">
            <option value="all">All priorities</option>
            {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={label} onChange={(e) => setLabel(e.target.value)} className={selectCls} aria-label="Label filter">
            <option value="all">All labels</option>
            {store.data.labels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select value={due} onChange={(e) => setDue(e.target.value as DueFilter)} className={selectCls} aria-label="Due filter">
            <option value="all">Any due date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due today</option>
            <option value="week">Due this week</option>
            <option value="none">No due date</option>
          </select>
          {filtersActive && <button onClick={() => { setQ(''); setPrio('all'); setLabel('all'); setDue('all') }} className="text-xs text-indigo-600 hover:underline">Clear filters</button>}
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-[1600px] px-4 py-5">
        {view === 'board'
          ? <Board tasks={filtered} store={store} onOpen={openEdit} onNew={openNew} />
          : <ListView tasks={filtered} store={store} onOpen={openEdit} />}
      </main>

      <TaskModal open={modalOpen} task={editing} defaultStatus={newStatus} store={store} onClose={() => setModalOpen(false)} />
      <SettingsModal open={settings} onClose={() => setSettings(false)} store={store} />
    </div>
  )
}
