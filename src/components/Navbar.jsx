import { Moon, Sun, LogOut, Bell, Search } from "lucide-react";

function Navbar({ user, onLogout, theme, setTheme }) {
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="top-header">
      <div className="header-search">
        <Search size={18} />
        <input placeholder="Search or type command..." />
      </div>

      <div className="header-actions">
        <button type="button" className="icon-button" onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button type="button" className="icon-button">
          <Bell size={18} />
        </button>

        <div className="user-box">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="user-info">
            <strong>{user?.displayName || "dotWatch User"}</strong>
            <small>{user?.email}</small>
          </div>
        </div>

        <button
          type="button"
          className="icon-button logout-icon"
          onClick={onLogout}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default Navbar;