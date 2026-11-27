export type Status = 'backlog' | 'todo' | 'in_progress' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface Label {
  id: string
  name: string
  color: string
}

/** Image or link attached to a task (e.g. a proof-of-completion screenshot). */
export interface TaskAttachment {
  id: string
  url: string
  caption: string
  kind: 'image' | 'link'
}

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  dueDate: string | null // YYYY-MM-DD
  labelIds: string[]
  order: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
  attachments: TaskAttachment[]
}

export interface AppData {
  version: 1
  tasks: Task[]
  labels: Label[]
}

export function normalizeData(d: AppData): AppData {
  return {
    version: 1,
    labels: Array.isArray(d.labels) ? d.labels : [],
    tasks: (Array.isArray(d.tasks) ? d.tasks : []).map((t) => ({
      ...t,
      attachments: Array.isArray(t.attachments) ? t.attachments : [],
    })),
  }
}

export const STATUSES: { id: Status; name: string; accent: string }[] = [
  { id: 'backlog', name: 'Backlog', accent: 'bg-slate-400' },
  { id: 'todo', name: 'To do', accent: 'bg-sky-500' },
  { id: 'in_progress', name: 'In progress', accent: 'bg-amber-500' },
  { id: 'done', name: 'Done', accent: 'bg-emerald-500' },
]

export const PRIORITIES: { id: Priority; name: string; rank: number; cls: string }[] = [
  { id: 'urgent', name: 'Urgent', rank: 4, cls: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' },
  { id: 'high', name: 'High', rank: 3, cls: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300' },
  { id: 'medium', name: 'Medium', rank: 2, cls: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300' },
  { id: 'low', name: 'Low', rank: 1, cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300' },
]

export const LABEL_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b']
