import { PRIORITIES, type Priority, type Task } from './types'

export const uid = () =>
  (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36))

export const todayISO = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

export const priorityRank = (p: Priority) => PRIORITIES.find((x) => x.id === p)?.rank ?? 0

export type DueState = 'overdue' | 'today' | 'soon' | 'later' | 'none'

export function dueState(task: Task): DueState {
  if (!task.dueDate) return 'none'
  if (task.status === 'done') return 'later'
  const t = todayISO()
  if (task.dueDate < t) return 'overdue'
  if (task.dueDate === t) return 'today'
  const diff = (new Date(task.dueDate).getTime() - new Date(t).getTime()) / 86400000
  return diff <= 3 ? 'soon' : 'later'
}

export function formatDue(iso: string): string {
  const t = todayISO()
  const diff = Math.round((new Date(iso).getTime() - new Date(t).getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' })
}

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
