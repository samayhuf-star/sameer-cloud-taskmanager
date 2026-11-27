import { useCallback, useEffect, useState } from 'react'
import type { AppData, Label, Status, Task } from './types'
import { normalizeData } from './types'
import { defaultBoard } from './seed'
import { uid } from './utils'

const KEY = 'tasks-app:data:v1'

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const d = JSON.parse(raw) as AppData
      if (d && Array.isArray(d.tasks) && Array.isArray(d.labels)) return normalizeData(d)
    }
  } catch { /* ignore corrupt data */ }
  return defaultBoard()
}

export function useStore() {
  const [data, setData] = useState<AppData>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data))
  }, [data])

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === KEY && e.newValue) setData(normalizeData(JSON.parse(e.newValue))) }
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
        id: uid(), description: '', priority: 'medium', dueDate: null, labelIds: [], attachments: [],
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
