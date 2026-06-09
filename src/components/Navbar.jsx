function Navbar({ user, onLogout }) {
  return (
    <header className="navbar">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.email || "User"}</p>
      </div>

      <button type="button" className="ghost-button" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
}

export default Navbar;