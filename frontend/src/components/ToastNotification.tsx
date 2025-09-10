import { useEffect } from 'react'
import { useAppStore } from '@state/store'

export default function ToastNotification() {
  const alerts = useAppStore(s => s.alerts)
  
  useEffect(() => {
    if (alerts.length === 0) return
    
    const latest = alerts[0]
    const isRecent = Date.now() - latest.ts < 5000 // Show if less than 5 seconds old
    
    if (isRecent && 'Notification' in window) {
      // Request permission if not granted
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('MetalSense Alert', {
          body: latest.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: latest.id,
        })
      }
    }
  }, [alerts])

  // Show latest alert as toast
  const recentAlert = alerts.find(a => Date.now() - a.ts < 10000)
  
  if (!recentAlert) return null

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: '80px', 
        right: '16px', 
        zIndex: 1500,
        maxWidth: '300px',
        animation: 'slideIn 0.3s ease-out'
      }}
      className={`card badge ${recentAlert.level === 'danger' ? 'high' : recentAlert.level === 'warning' ? 'moderate' : ''}`}
    >
      <strong>🔔 Alert</strong>
      <div style={{ marginTop: '4px', fontSize: '14px' }}>{recentAlert.message}</div>
      <div style={{ marginTop: '4px', fontSize: '12px', opacity: 0.7 }}>
        {new Date(recentAlert.ts).toLocaleTimeString()}
      </div>
    </div>
  )
}
