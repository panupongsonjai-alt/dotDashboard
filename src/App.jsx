<div className="layout">
  <Sidebar page={page} setPage={setPage} />

  <main className="main">
    <Navbar user={user} onLogout={handleLogout} />

    {page === "dashboard" && <Dashboard />}
    {page === "devices" && <Devices />}
    {page === "settings" && <Settings />}
  </main>
</div>