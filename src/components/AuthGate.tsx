import { useState, type FormEvent, type ReactNode } from 'react'
import { sha256 } from '../utils'

const HASH_KEY = 'tasks-app:pwhash'
const SESSION_KEY = 'tasks-app:session'
const BUILD_HASH = (import.meta.env.VITE_PASSWORD_SHA256 as string | undefined)?.trim() || ''

/**
 * Lightweight single-user password gate.
 * - If VITE_PASSWORD_SHA256 is set at build time, that password unlocks the app.
 * - Otherwise the first visitor in a browser creates a password, stored (hashed) in localStorage.
 * Data lives in the browser's localStorage, so this gate protects the UI on a shared device;
 * it is not server-side security.
 */
export const hashPassword = (pw: string) => sha256('tasks-app:' + pw)
export const storedHash = () => BUILD_HASH || localStorage.getItem(HASH_KEY) || ''
export const canChangePassword = !BUILD_HASH
export const setStoredHash = (h: string) => localStorage.setItem(HASH_KEY, h)

export default function AuthGate({ children }: { children: (lock: () => void) => ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => {
    const s = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY)
    return !!s && s === storedHash()
  })
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const isSetup = !storedHash()

  const lock = () => {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    setUnlocked(false)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (isSetup) {
      if (pw.length < 4) return setError('Use at least 4 characters.')
      if (pw !== pw2) return setError('Passwords do not match.')
      setStoredHash(await hashPassword(pw))
    } else if ((await hashPassword(pw)) !== storedHash()) {
      setPw('')
      return setError('Wrong password.')
    }
    const h = storedHash()
    sessionStorage.setItem(SESSION_KEY, h)
    if (remember) localStorage.setItem(SESSION_KEY, h)
    setPw(''); setPw2('')
    setUnlocked(true)
  }

  if (unlocked) return <>{children(lock)}</>

  return (
    <div className="min-h-full grid place-items-center p-6 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white/90 dark:bg-slate-900/90 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800 p-8 space-y-5">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-semibold">Tasks</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isSetup ? 'Create a password to protect your board' : 'Enter your password to continue'}</p>
          </div>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Password</span>
          <input autoFocus type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={isSetup ? 'new-password' : 'current-password'}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
        </label>
        {isSetup && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Confirm password</span>
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
        )}
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-indigo-600" />
          Keep me signed in on this device
        </label>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 transition">{isSetup ? 'Create password & start' : 'Unlock'}</button>
        {isSetup && <p className="text-xs text-slate-500">Your tasks are stored privately in this browser. You can export a backup any time from Settings.</p>}
      </form>
    </div>
  )
}
