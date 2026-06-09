import { useEffect, useState } from 'react'
import DeviceCard from '../components/DeviceCard.jsx'
import { getDevices } from '../services/api.js'

function Devices() {
  const [devices, setDevices] = useState([])

  useEffect(() => {
    getDevices().then(setDevices)
  }, [])

  return (
    <div className="page">
      <section className="panel">
        <div className="section-title">
          <h2>Device Management</h2>
          <p>จัดการและตรวจสอบอุปกรณ์ dotWatch ทั้งหมด</p>
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

export default Devices
