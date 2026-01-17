import './index.css'
import App from './app.jsx'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx';
import { ChatProvider } from '../context/chatContext.jsx';






createRoot(document.getElementById('app')).render(
  <BrowserRouter>
  <AuthProvider>
  <ChatProvider>
      <App />
 </ChatProvider>
  </AuthProvider>
  </BrowserRouter>
)
