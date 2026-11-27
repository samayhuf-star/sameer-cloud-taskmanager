import { useCallback, useEffect, useState } from 'react'
import type { AppData, Label, Status, Task } from './types'
import { todayISO, uid } from './utils'

const KEY = 'tasks-app:data:v1'

function seed(): AppData {
  const now = new Date().toISOString()
  const labels: Label[] = [
    { id: uid(), name: 'Work', color: '#6366f1' },
    { id: uid(), name: 'Personal', color: '#22c55e' },
    { id: uid(), name: 'Bug', color: '#ef4444' },
  ]
  const addDays = (n: number) => {
    const d = new Date(todayISO()); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10)
  }
  const mk = (title: string, status: Status, priority: Task['priority'], due: number | null, labelIdx: number[], order: number, description = ''): Task => ({
    id: uid(), title, description, status, priority, dueDate: due === null ? null : addDays(due),
    labelIds: labelIdx.map((i) => labels[i].id), order, createdAt: now, updatedAt: now,
    completedAt: status === 'done' ? now : null,
  })
  return {
    version: 1,
    labels,
    tasks: [
      mk('Welcome! Drag me to another column', 'todo', 'medium', 0, [1], 0, 'Tasks are saved in this browser. Use Export in settings to back them up.'),
      mk('Plan the week', 'todo', 'high', 1, [0], 1),
      mk('Fix login redirect', 'in_progress', 'urgent', -1, [0, 2], 0, 'Overdue tasks are highlighted in red.'),
      mk('Ideas for the weekend', 'backlog', 'low', null, [1], 0),
      mk('Set up the task manager', 'done', 'medium', null, [0], 0),
    ],
  }
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const d = JSON.parse(raw) as AppData
      if (d && Array.isArray(d.tasks) && Array.isArray(d.labels)) return d
    }
  } catch { /* ignore corrupt data */ }
  return seed()
}

export function useStore() {
  const [data, setData] = useState<AppData>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data))
  }, [data])

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === KEY && e.newValue) setData(JSON.parse(e.newValue)) }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const saveTask = useCallback((t: Partial<Task> & { title: string }) => {
    setData((d) => {
      const now = new Date().toISOString()
      if (t.id && d.tasks.some((x) => x.id === t.id)) {
        return { ...d, tasks: d.tasks.map((x) => x.id === t.id ? {
          ...x, ...t, updatedAt: now,
          completedAt: t.status === 'done' ? (x.completedAt ?? now) : t.status ? null : x.completedAt,
        } : x) }
      }
      const status = t.status ?? 'todo'
      const minOrder = Math.min(0, ...d.tasks.filter((x) => x.status === status).map((x) => x.order))
      const task: Task = {
        id: uid(), description: '', priority: 'medium', dueDate: null, labelIds: [],
        ...t, status, order: minOrder - 1, createdAt: now, updatedAt: now,
        completedAt: status === 'done' ? now : null,
      } as Task
      return { ...d, tasks: [...d.tasks, task] }
    })
  }, [])

  const deleteTask = useCallback((id: string) => setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })), [])

  /** Move a task to `status`, placing it before `beforeId` (or at the end). */
  const moveTask = useCallback((id: string, status: Status, beforeId: string | null) => {
    setData((d) => {
      const task = d.tasks.find((t) => t.id === id)
      if (!task) return d
      const col = d.tasks.filter((t) => t.status === status && t.id !== id).sort((a, b) => a.order - b.order)
      const idx = beforeId ? col.findIndex((t) => t.id === beforeId) : -1
      col.splice(idx < 0 ? col.length : idx, 0, task)
      const now = new Date().toISOString()
      const orders = new Map(col.map((t, i) => [t.id, i]))
      return {
        ...d,
        tasks: d.tasks.map((t) => {
          if (t.id === id) return { ...t, status, order: orders.get(t.id)!, updatedAt: now,
            completedAt: status === 'done' ? (t.status === 'done' ? t.completedAt : now) : null }
          return orders.has(t.id) ? { ...t, order: orders.get(t.id)! } : t
        }),
      }
    })
  }, [])

  const saveLabel = useCallback((l: Label) => setData((d) => ({
    ...d, labels: d.labels.some((x) => x.id === l.id) ? d.labels.map((x) => x.id === l.id ? l : x) : [...d.labels, l],
  })), [])

  const deleteLabel = useCallback((id: string) => setData((d) => ({
    ...d, labels: d.labels.filter((l) => l.id !== id),
    tasks: d.tasks.map((t) => ({ ...t, labelIds: t.labelIds.filter((x) => x !== id) })),
  })), [])

  const clearDone = useCallback(() => setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.status !== 'done') })), [])

  const replaceAll = useCallback((next: AppData) => setData(next), [])

  return { data, saveTask, deleteTask, moveTask, saveLabel, deleteLabel, clearDone, replaceAll }
}

export type Store = ReturnType<typeof useStore>
