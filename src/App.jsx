import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Devices from './pages/Devices.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'

function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  const renderPage = () => {
    switch (activePage) {
      case 'devices':
        return <Devices />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="main">
        <Navbar onLogout={() => setIsLoggedIn(false)} />
        {renderPage()}
      </main>
    </div>
  )
}

export default App
