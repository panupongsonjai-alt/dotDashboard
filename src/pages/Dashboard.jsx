import { useEffect, useState } from 'react'
import DeviceCard from '../components/DeviceCard.jsx'
import ChartWidget from '../components/ChartWidget.jsx'

import {
  auth,
  listenUserDevices,
} from '../services/firebase'

function Dashboard() {
  const [devices, setDevices] = useState([])
  const [projectName, setProjectName] = useState('dotWatch')

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const unsubscribe = listenUserDevices(user.uid, setDevices)

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const name = localStorage.getItem('projectName') || 'dotWatch'
    setProjectName(name)
  }, [])

  const onlineCount = devices.filter(
    (device) => device.status === 'online'
  ).length

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
          <strong>{projectName}</strong>
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
            <DeviceCard
              key={device.id}
              device={device}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard