import { useEffect, useState } from 'react'
import DeviceCard from '../components/DeviceCard.jsx'
import ChartWidget from '../components/ChartWidget.jsx'
import { getDevices } from '../services/api.js'

function Dashboard() {
  const [devices, setDevices] = useState([])

  useEffect(() => {
    getDevices().then(setDevices)
  }, [])

  const onlineCount = devices.filter((device) => device.status === 'online').length

  return (
    <div className="page">
      <section className="summary-grid">
        <div className="summary-card">
          <span>Total Devices</span>
          <strong>{devices.length}</strong>
        </div>
        <div className="summary-card">
          <span>Online</span>
          <strong>{onlineCount}</strong>
        </div>
        <div className="summary-card">
          <span>Offline</span>
          <strong>{devices.length - onlineCount}</strong>
        </div>
        <div className="summary-card">
          <span>Project</span>
          <strong>dotWatch</strong>
        </div>
      </section>

      <ChartWidget />

      <section className="panel">
        <div className="section-title">
          <h2>Devices Overview</h2>
          <p>สถานะล่าสุดของอุปกรณ์ในระบบ</p>
        </div>
        <div className="device-grid">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
