import type { Label, Task } from '../types'
import { cx, dueState } from '../utils'
import { DueBadge, LabelChip, PriorityBadge } from './ui'

export default function TaskCard({ task, labels, onOpen, onToggleDone, dragging, onDragStart, onDragEnd }: {
  task: Task; labels: Label[]; onOpen: () => void; onToggleDone: () => void
  dragging?: boolean; onDragStart?: (e: React.DragEvent) => void; onDragEnd?: () => void
}) {
  const done = task.status === 'done'
  const overdue = dueState(task) === 'overdue'
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()} tabIndex={0} data-task-id={task.id}
      className={cx('group rounded-xl bg-white dark:bg-slate-900 p-3 shadow-sm ring-1 cursor-grab active:cursor-grabbing select-none transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500',
        overdue ? 'ring-rose-300 dark:ring-rose-500/40' : 'ring-slate-200 dark:ring-slate-800', dragging && 'opacity-40')}>
      <div className="flex items-start gap-2">
        <button onClick={(e) => { e.stopPropagation(); onToggleDone() }} aria-label={done ? 'Mark as not done' : 'Mark as done'}
          className={cx('mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 grid place-items-center transition',
            done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500')}>
          {done && <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor"><path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z"/></svg>}
        </button>
        <p className={cx('text-sm font-medium leading-snug break-words min-w-0', done && 'line-through text-slate-400')}>{task.title}</p>
      </div>
      {task.description && <p className="mt-1.5 ml-6 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>}
      {task.attachments?.some((a) => a.kind === 'image') && (
        <div className="mt-2 ml-6 overflow-hidden rounded-md ring-1 ring-slate-200 dark:ring-slate-700">
          <img src={task.attachments.find((a) => a.kind === 'image')!.url} alt="" className="h-20 w-full object-cover object-top bg-slate-100 dark:bg-slate-800" />
        </div>
      )}
      <div className="mt-2.5 ml-6 flex flex-wrap items-center gap-1.5">
        <PriorityBadge p={task.priority} />
        <DueBadge task={task} />
        {task.labelIds.map((id) => labels.find((l) => l.id === id)).filter(Boolean).map((l) => <LabelChip key={l!.id} label={l!} />)}
        {(task.attachments?.length ?? 0) > 0 && (
          <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {task.attachments.length} proof{task.attachments.length === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </div>
  )
}
