import { Moon, Sun } from "lucide-react";

function Navbar({ user, onLogout, theme, setTheme }) {
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="navbar">
      <div>
        <h1>dotWatch</h1>
        <p>{user?.email}</p>
      </div>

      <div className="navbar-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button type="button" className="ghost-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;