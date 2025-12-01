import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { MedicationProvider } from './context/MedicationContext.jsx'
import { ReminderProvider } from './context/ReminderContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <MedicationProvider>
          <ReminderProvider>
            <App />
          </ReminderProvider>
        </MedicationProvider>
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>,
)
