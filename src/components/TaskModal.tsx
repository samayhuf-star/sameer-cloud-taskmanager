import { useEffect, useState, type FormEvent } from 'react'
import { PRIORITIES, STATUSES, LABEL_COLORS, type Label, type Status, type Task, type TaskAttachment } from '../types'
import type { Store } from '../store'
import { Modal, LabelChip, inputCls, btnPrimary, btnGhost } from './ui'
import { uid } from '../utils'

type Draft = Pick<Task, 'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'labelIds' | 'attachments'> & { id?: string }

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|svg|avif)(\?.*)?$/i.test(url) || url.startsWith('data:image/')
}

export default function TaskModal({ open, task, defaultStatus, store, onClose }: {
  open: boolean; task: Task | null; defaultStatus: Status; store: Store; onClose: () => void
}) {
  const blank = (): Draft => ({ title: '', description: '', status: defaultStatus, priority: 'medium', dueDate: null, labelIds: [], attachments: [] })
  const [d, setD] = useState<Draft>(blank)
  const [newLabel, setNewLabel] = useState('')
  const [attUrl, setAttUrl] = useState('')
  const [attCaption, setAttCaption] = useState('')

  useEffect(() => {
    if (open) {
      setD(task ? { ...task, attachments: task.attachments ?? [] } : blank())
      setNewLabel('')
      setAttUrl('')
      setAttCaption('')
    }
  }, [open, task]) // eslint-disable-line react-hooks/exhaustive-deps

  const labels = store.data.labels
  const toggleLabel = (id: string) => setD((x) => ({ ...x, labelIds: x.labelIds.includes(id) ? x.labelIds.filter((l) => l !== id) : [...x.labelIds, id] }))

  function addLabel() {
    const name = newLabel.trim()
    if (!name) return
    const existing = labels.find((l) => l.name.toLowerCase() === name.toLowerCase())
    const l: Label = existing ?? { id: uid(), name, color: LABEL_COLORS[labels.length % LABEL_COLORS.length] }
    if (!existing) store.saveLabel(l)
    setD((x) => ({ ...x, labelIds: x.labelIds.includes(l.id) ? x.labelIds : [...x.labelIds, l.id] }))
    setNewLabel('')
  }

  function addAttachment() {
    const url = attUrl.trim()
    if (!url) return
    const att: TaskAttachment = {
      id: uid(),
      url,
      caption: attCaption.trim(),
      kind: isImageUrl(url) ? 'image' : 'link',
    }
    setD((x) => ({ ...x, attachments: [...x.attachments, att] }))
    setAttUrl('')
    setAttCaption('')
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!d.title.trim()) return
    store.saveTask({ ...d, title: d.title.trim(), description: d.description.trim(), attachments: d.attachments })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'} wide>
      <form onSubmit={submit} className="space-y-4">
        <input autoFocus placeholder="Task title" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })}
          className={inputCls + ' text-base font-medium'} required maxLength={200} />
        <textarea placeholder="Description (optional)" rows={4} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })}
          className={inputCls + ' resize-y'} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="space-y-1"><span className="text-xs font-medium text-slate-500">Status</span>
            <select className={inputCls} value={d.status} onChange={(e) => setD({ ...d, status: e.target.value as Status })}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select></label>
          <label className="space-y-1"><span className="text-xs font-medium text-slate-500">Priority</span>
            <select className={inputCls} value={d.priority} onChange={(e) => setD({ ...d, priority: e.target.value as Task['priority'] })}>
              {PRIORITIES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></label>
          <label className="space-y-1"><span className="text-xs font-medium text-slate-500">Due date</span>
            <div className="flex gap-1">
              <input type="date" className={inputCls} value={d.dueDate ?? ''} onChange={(e) => setD({ ...d, dueDate: e.target.value || null })} />
              {d.dueDate && <button type="button" className={btnGhost} onClick={() => setD({ ...d, dueDate: null })} aria-label="Clear due date">×</button>}
            </div></label>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-500">Labels</span>
          <div className="flex flex-wrap gap-1.5">
            {labels.map((l) => (
              <button type="button" key={l.id} onClick={() => toggleLabel(l.id)}
                className={'rounded-full transition ' + (d.labelIds.includes(l.id) ? 'ring-2 ring-offset-1 ring-indigo-500 dark:ring-offset-slate-900' : 'opacity-60 hover:opacity-100')}>
                <LabelChip label={l} />
              </button>
            ))}
            {labels.length === 0 && <span className="text-xs text-slate-400">No labels yet</span>}
          </div>
          <div className="flex gap-2">
            <input placeholder="Add a label…" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel() } }} className={inputCls} maxLength={30} />
            <button type="button" onClick={addLabel} className={btnGhost}>Add</button>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-slate-500">Proof &amp; attachments</span>
          {d.attachments.length === 0 && <p className="text-xs text-slate-400">No attachments yet.</p>}
          <ul className="space-y-3">
            {d.attachments.map((a) => (
              <li key={a.id} className="rounded-lg ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                {a.kind === 'image' ? (
                  <a href={a.url} target="_blank" rel="noreferrer" className="block">
                    <img src={a.url} alt={a.caption || 'Attachment'} className="w-full max-h-64 object-contain bg-white dark:bg-slate-900" />
                  </a>
                ) : null}
                <div className="flex items-start justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    {a.caption && <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{a.caption}</p>}
                    <a href={a.url} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-600 dark:text-indigo-400 underline break-all">{a.url}</a>
                  </div>
                  <button type="button" className="text-xs text-rose-600 hover:underline shrink-0"
                    onClick={() => setD((x) => ({ ...x, attachments: x.attachments.filter((t) => t.id !== a.id) }))}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input placeholder="Image or link URL" value={attUrl} onChange={(e) => setAttUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttachment() } }} className={inputCls} />
            <input placeholder="Caption (optional)" value={attCaption} onChange={(e) => setAttCaption(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttachment() } }} className={inputCls} />
            <button type="button" onClick={addAttachment} className={btnGhost} disabled={!attUrl.trim()}>Attach</button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {task ? (
            <button type="button" className="text-sm text-rose-600 hover:underline"
              onClick={() => { if (confirm('Delete this task?')) { store.deleteTask(task.id); onClose() } }}>Delete task</button>
          ) : <span />}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
            <button className={btnPrimary} disabled={!d.title.trim()}>{task ? 'Save changes' : 'Create task'}</button>
          </div>
        </div>
        {task && <p className="text-[11px] text-slate-400">Created {new Date(task.createdAt).toLocaleString()} · Updated {new Date(task.updatedAt).toLocaleString()}</p>}
      </form>
    </Modal>
  )
}
