function Login({ onLogin }) {
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="brand login-brand">
          <span className="brand-dot" />
          <div>
            <strong>dotWatch</strong>
            <small>Easy Monitoring</small>
          </div>
        </div>

        <h1>เข้าสู่ระบบ</h1>
        <label>
          Username
          <input defaultValue="admin" />
        </label>
        <label>
          Password
          <input type="password" defaultValue="admin" />
        </label>

        <button className="primary-button full" onClick={onLogin}>Login</button>
      </section>
    </main>
  )
}

export default Login
