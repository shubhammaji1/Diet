import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Chatbot from './components/Chatbot.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Chatbot />
  </StrictMode>,
)
