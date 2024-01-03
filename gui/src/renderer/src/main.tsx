import './assets/index.css'
import ReactDOM from 'react-dom/client'
import App from './App'

// Using React strict mode causes issues in the python script

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
)