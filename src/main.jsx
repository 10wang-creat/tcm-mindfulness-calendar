import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// PWA Service Worker 更新通知
const updateSW = registerSW({
  onNeedRefresh() {
    // 顯示更新提示
    const confirmed = confirm('🌿 中藥日曆有新版本可用，要立即更新嗎？')
    if (confirmed) updateSW(true)
  },
  onOfflineReady() {
    console.log('✅ 中藥日曆已可離線使用')
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
