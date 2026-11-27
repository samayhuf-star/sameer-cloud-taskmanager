import { useRef, useState } from 'react'
import { LABEL_COLORS, normalizeData, type AppData } from '../types'
import type { Store } from '../store'
import { Modal, inputCls, btnGhost, btnPrimary } from './ui'
import { canChangePassword, hashPassword, setStoredHash } from './AuthGate'
import { uid } from '../utils'

export default function SettingsModal({ open, onClose, store }: { open: boolean; onClose: () => void; store: Store }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')

  function exportJson() {
    const blob = new Blob([JSON.stringify(store.data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `tasks-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importJson(file: File) {
    try {
      const d = JSON.parse(await file.text()) as AppData
      if (!Array.isArray(d.tasks) || !Array.isArray(d.labels)) throw new Error('bad file')
      if (confirm(`Replace your current board with ${d.tasks.length} tasks from this backup?`)) {
        store.replaceAll(normalizeData({ version: 1, tasks: d.tasks, labels: d.labels })); setMsg('Backup imported.')
      }
    } catch { setMsg('That file is not a valid tasks backup.') }
  }

  async function changePassword() {
    if (pw.length < 4) return setMsg('Use at least 4 characters.')
    const h = await hashPassword(pw)
    setStoredHash(h)
    sessionStorage.setItem('tasks-app:session', h)
    if (localStorage.getItem('tasks-app:session')) localStorage.setItem('tasks-app:session', h)
    setPw(''); setMsg('Password updated.')
  }

  return (
    <Modal open={open} onClose={() => { setMsg(''); onClose() }} title="Settings">
      <div className="space-y-6">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Labels</h3>
          <ul className="space-y-1.5">
            {store.data.labels.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <input type="color" value={l.color} onChange={(e) => store.saveLabel({ ...l, color: e.target.value })} className="h-7 w-7 rounded cursor-pointer bg-transparent" aria-label="Label colour" />
                <input value={l.name} onChange={(e) => store.saveLabel({ ...l, name: e.target.value })} className={inputCls + ' py-1'} maxLength={30} />
                <button onClick={() => confirm(`Delete label "${l.name}"?`) && store.deleteLabel(l.id)} className="text-xs text-rose-600 hover:underline px-2">Delete</button>
              </li>
            ))}
          </ul>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { store.saveLabel({ id: uid(), name: name.trim(), color: LABEL_COLORS[store.data.labels.length % LABEL_COLORS.length] }); setName('') } }}>
            <input placeholder="New label name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} maxLength={30} />
            <button className={btnGhost}>Add</button>
          </form>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Backup</h3>
          <p className="text-xs text-slate-500">Tasks are stored in this browser. Export a JSON backup to move them to another device.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportJson} className={btnPrimary}>Export JSON</button>
            <button onClick={() => fileRef.current?.click()} className={btnGhost}>Import JSON…</button>
            <button onClick={() => confirm('Delete all completed tasks?') && store.clearDone()} className={btnGhost}>Clear completed</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = '' }} />
          </div>
        </section>

        {canChangePassword && (
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Change password</h3>
            <div className="flex gap-2">
              <input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} autoComplete="new-password" />
              <button onClick={changePassword} className={btnGhost}>Update</button>
            </div>
          </section>
        )}
        {msg && <p className="text-sm text-indigo-600 dark:text-indigo-400">{msg}</p>}
        <p className="text-[11px] text-slate-400">Open source · MIT licensed · <a className="underline" href="https://github.com/samayhuf-star/sameer-cloud-taskmanager" target="_blank" rel="noreferrer">GitHub</a></p>
      </div>
    </Modal>
  )
}
