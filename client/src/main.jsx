import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import {BrowserRouter as Router} from 'react-router-dom'
import { Provider } from 'react-redux'
// import store from './store/store.js'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
        <App />
    </Router>
  </StrictMode>,
)
