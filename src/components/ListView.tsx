import { useState } from 'react'
import { STATUSES, type Status, type Task } from '../types'
import type { Store } from '../store'
import { cx, priorityRank } from '../utils'
import { DueBadge, LabelChip, PriorityBadge } from './ui'

type SortKey = 'due' | 'priority' | 'created' | 'title' | 'status'
const statusRank = (s: Status) => STATUSES.findIndex((x) => x.id === s)

export default function ListView({ tasks, store, onOpen }: { tasks: Task[]; store: Store; onOpen: (t: Task) => void }) {
  const [sort, setSort] = useState<SortKey>('due')
  const [asc, setAsc] = useState(true)

  const sorted = [...tasks].sort((a, b) => {
    let r = 0
    switch (sort) {
      case 'due': r = (a.dueDate ?? '9999') .localeCompare(b.dueDate ?? '9999'); break
      case 'priority': r = priorityRank(b.priority) - priorityRank(a.priority); break
      case 'created': r = b.createdAt.localeCompare(a.createdAt); break
      case 'title': r = a.title.localeCompare(b.title); break
      case 'status': r = statusRank(a.status) - statusRank(b.status); break
    }
    if (r === 0) r = priorityRank(b.priority) - priorityRank(a.priority)
    return asc ? r : -r
  })

  const Th = ({ k, children, className }: { k: SortKey; children: string; className?: string }) => (
    <th className={cx('px-3 py-2 text-left text-xs font-semibold text-slate-500', className)}>
      <button onClick={() => (sort === k ? setAsc(!asc) : (setSort(k), setAsc(true)))} className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200">
        {children}{sort === k && <span>{asc ? '↑' : '↓'}</span>}
      </button>
    </th>
  )

  if (tasks.length === 0) return <p className="text-center text-sm text-slate-500 py-16">No tasks match your filters.</p>

  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 bg-white dark:bg-slate-900 scroll-thin">
      <table className="w-full min-w-[720px]">
        <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
          <tr><th className="w-10" /><Th k="title">Task</Th><Th k="status">Status</Th><Th k="priority">Priority</Th><Th k="due">Due</Th><th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Labels</th></tr>
        </thead>
        <tbody>
          {sorted.map((t) => {
            const done = t.status === 'done'
            return (
              <tr key={t.id} onClick={() => onOpen(t)} className="border-b last:border-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer">
                <td className="pl-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={done} aria-label="Done" className="h-4 w-4 accent-emerald-500 cursor-pointer"
                    onChange={() => store.moveTask(t.id, done ? 'todo' : 'done', null)} />
                </td>
                <td className="px-3 py-2.5">
                  <p className={cx('text-sm font-medium', done && 'line-through text-slate-400')}>{t.title}</p>
                  {t.description && <p className="text-xs text-slate-500 truncate max-w-md">{t.description}</p>}
                </td>
                <td className="px-3" onClick={(e) => e.stopPropagation()}>
                  <select value={t.status} onChange={(e) => store.moveTask(t.id, e.target.value as Status, null)}
                    className="text-xs rounded-md bg-transparent border border-slate-200 dark:border-slate-700 px-1.5 py-1">
                    {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </td>
                <td className="px-3"><PriorityBadge p={t.priority} /></td>
                <td className="px-3">{t.dueDate ? <DueBadge task={t} /> : <span className="text-xs text-slate-400">—</span>}</td>
                <td className="px-3"><div className="flex flex-wrap gap-1">{t.labelIds.map((id) => store.data.labels.find((l) => l.id === id)).filter(Boolean).map((l) => <LabelChip key={l!.id} label={l!} />)}</div></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
