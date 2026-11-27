import { useState } from 'react'
import { STATUSES, type Status, type Task } from '../types'
import type { Store } from '../store'
import { cx } from '../utils'
import TaskCard from './TaskCard'

export default function Board({ tasks, store, onOpen, onNew }: {
  tasks: Task[]; store: Store; onOpen: (t: Task) => void; onNew: (s: Status) => void
}) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [over, setOver] = useState<{ status: Status; beforeId: string | null } | null>(null)

  function onDragOverColumn(e: React.DragEvent, status: Status) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    // Find the card under the cursor to compute the insertion point.
    const cards = [...(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[data-task-id]')]
    let beforeId: string | null = null
    for (const c of cards) {
      const r = c.getBoundingClientRect()
      if (e.clientY < r.top + r.height / 2) { beforeId = c.dataset.taskId!; break }
    }
    if (beforeId === dragId) beforeId = null
    if (over?.status !== status || over.beforeId !== beforeId) setOver({ status, beforeId })
  }

  function onDrop(e: React.DragEvent, status: Status) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') || dragId
    if (id) store.moveTask(id, status, over?.status === status ? over.beforeId : null)
    setDragId(null); setOver(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scroll-thin snap-x">
      {STATUSES.map((col) => {
        const items = tasks.filter((t) => t.status === col.id).sort((a, b) => a.order - b.order)
        const active = over?.status === col.id
        return (
          <section key={col.id} onDragOver={(e) => onDragOverColumn(e, col.id)} onDrop={(e) => onDrop(e, col.id)}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null) }}
            className={cx('snap-start shrink-0 w-[85vw] sm:w-72 lg:flex-1 lg:min-w-64 rounded-2xl p-3 transition flex flex-col max-h-[calc(100vh-11rem)]',
              active ? 'bg-indigo-50 ring-2 ring-indigo-300 dark:bg-indigo-500/10 dark:ring-indigo-500/40' : 'bg-slate-100/80 dark:bg-slate-900/50')}>
            <header className="flex items-center justify-between px-1 pb-3">
              <div className="flex items-center gap-2">
                <span className={cx('h-2 w-2 rounded-full', col.accent)} />
                <h2 className="text-sm font-semibold">{col.name}</h2>
                <span className="text-xs text-slate-500 rounded-full bg-white dark:bg-slate-800 px-2 py-0.5">{items.length}</span>
              </div>
              <button onClick={() => onNew(col.id)} className="rounded-md p-1 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800" aria-label={`Add task to ${col.name}`}>
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor"><path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z"/></svg>
              </button>
            </header>
            <div className="flex flex-col gap-2 overflow-y-auto scroll-thin min-h-16 pr-0.5">
              {items.map((t) => (
                <div key={t.id}>
                  {active && over?.beforeId === t.id && dragId !== t.id && <div className="h-1 rounded-full bg-indigo-400 mb-2" />}
                  <TaskCard task={t} labels={store.data.labels} dragging={dragId === t.id} onOpen={() => onOpen(t)}
                    onToggleDone={() => store.moveTask(t.id, t.status === 'done' ? 'todo' : 'done', null)}
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.id); e.dataTransfer.effectAllowed = 'move'; setDragId(t.id) }}
                    onDragEnd={() => { setDragId(null); setOver(null) }} />
                </div>
              ))}
              {active && over?.beforeId === null && dragId && <div className="h-1 rounded-full bg-indigo-400" />}
              {items.length === 0 && !active && (
                <button onClick={() => onNew(col.id)} className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-6 text-xs text-slate-400 hover:text-indigo-600 hover:border-indigo-300">
                  Drop tasks here or add one
                </button>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
