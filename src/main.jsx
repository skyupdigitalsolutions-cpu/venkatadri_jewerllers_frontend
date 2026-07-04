import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppUser from './AppUser.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode><AppUser /></StrictMode>,
)