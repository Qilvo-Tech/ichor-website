import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { countVisit } from './lib/visits'
import './index.css'
import './theme.css'
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
countVisit()
