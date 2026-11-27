import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AuthGate from './components/AuthGate'
import App from './App'

const theme = localStorage.getItem('tasks-app:theme')
if (theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate>{(lock) => <App onLock={lock} />}</AuthGate>
  </StrictMode>,
)
