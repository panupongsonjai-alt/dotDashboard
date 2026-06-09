import { LogOut } from 'lucide-react'

function Navbar({ onLogout }) {
  return (
    <header className="navbar">
      <div>
        <h1>dotDashboard</h1>
        <p>IoT monitoring dashboard for dotWatch devices</p>
      </div>
      <button className="ghost-button" onClick={onLogout}>
        <LogOut size={18} />
        Logout
      </button>
    </header>
  )
}

export default Navbar
