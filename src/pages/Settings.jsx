function Settings() {
  return (
    <div className="page">
      <section className="panel settings-panel">
        <div className="section-title">
          <h2>Settings</h2>
          <p>ตั้งค่าการเชื่อมต่อ Firebase และข้อมูลโปรเจกต์</p>
        </div>

        <div className="form-grid">
          <label>
            Firebase Database URL
            <input placeholder="https://your-project.firebaseio.com" />
          </label>
          <label>
            Device Group
            <input placeholder="dotwatch-devices" />
          </label>
          <label>
            Refresh Interval
            <select defaultValue="5000">
              <option value="3000">3 seconds</option>
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
            </select>
          </label>
        </div>

        <button className="primary-button">Save Settings</button>
      </section>
    </div>
  )
}

export default Settings
