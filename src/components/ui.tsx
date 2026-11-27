import { useEffect, type ReactNode } from 'react'
import { PRIORITIES, type Label, type Priority, type Task } from '../types'
import { cx, dueState, formatDue } from '../utils'

export function PriorityBadge({ p }: { p: Priority }) {
  const meta = PRIORITIES.find((x) => x.id === p)!
  return <span className={cx('inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium', meta.cls)}>{meta.name}</span>
}

export function LabelChip({ label, onRemove }: { label: Label; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: label.color + '22', color: label.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: label.color }} />
      {label.name}
      {onRemove && <button type="button" onClick={onRemove} className="ml-0.5 opacity-70 hover:opacity-100" aria-label={`Remove ${label.name}`}>×</button>}
    </span>
  )
}

export function DueBadge({ task }: { task: Task }) {
  if (!task.dueDate) return null
  const s = dueState(task)
  const cls = {
    overdue: 'text-rose-600 dark:text-rose-400 font-semibold',
    today: 'text-amber-600 dark:text-amber-400 font-semibold',
    soon: 'text-amber-600/80 dark:text-amber-300/80',
    later: 'text-slate-500 dark:text-slate-400',
    none: '',
  }[s]
  return (
    <span className={cx('inline-flex items-center gap-1 text-[11px]', cls)} title={task.dueDate}>
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor"><path d="M6 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V3a1 1 0 0 1 1-1Zm10 7H4v7h12V9Z"/></svg>
      {s === 'overdue' ? 'Overdue · ' : ''}{formatDue(task.dueDate)}
    </span>
  )
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title}
        className={cx('w-full rounded-2xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800 max-h-[90vh] overflow-y-auto scroll-thin', wide ? 'max-w-2xl' : 'max-w-lg')}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label="Close">
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor"><path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z"/></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export const inputCls = 'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500'
export const btnPrimary = 'rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 transition disabled:opacity-50'
export const btnGhost = 'rounded-lg text-sm font-medium px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition'
