import { Gauge, Cpu, Settings } from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Gauge },
  { id: 'devices', label: 'Devices', icon: Cpu },
  { id: 'settings', label: 'Settings', icon: Settings },
]

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-dot" />
        <div>
          <strong>dotWatch</strong>
          <small>Device Console</small>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className={activePage === item.id ? 'menu-item active' : 'menu-item'}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
