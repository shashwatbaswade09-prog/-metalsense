import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import TestApp from './App.test'
import './index.css'

console.log('MetalSense: main.tsx loading...')

const root = document.getElementById('root')
if (!root) {
  console.error('MetalSense: Root element not found!')
} else {
  console.log('MetalSense: Mounting React app...')
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
  console.log('MetalSense: React app mounted!')
}

