import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './style.css'

var div = document.getElementById('container')

if (div) {
    // 渲染你的 React 组件
    const root = createRoot(div)
    root.render(<App />)
}
