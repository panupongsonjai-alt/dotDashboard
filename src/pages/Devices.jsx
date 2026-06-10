import { useEffect, useState } from 'react'
import DeviceCard from '../components/DeviceCard.jsx'
import {
  auth,
  addUserDevice,
  listenUserDevices,
  deleteUserDevice,
} from '../services/firebase'

function Devices() {
  const [devices, setDevices] = useState([])
  const [deviceName, setDeviceName] = useState('')

  useEffect(() => {
    const user = auth.currentUser

    if (!user) return

    const unsubscribe = listenUserDevices(user.uid, setDevices)

    return () => unsubscribe()
  }, [])

  const handleAddDevice = async () => {
    const user = auth.currentUser

    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อน')
      return
    }

    const name = deviceName.trim() || `dotWatch ${devices.length + 1}`

    await addUserDevice(user.uid, name)

    setDeviceName('')
  }

  const handleDeleteDevice = async (deviceId) => {
    const user = auth.currentUser

    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อน')
      return
    }

    const ok = confirm('ต้องการลบ Device นี้ใช่ไหม?')
    if (!ok) return

    await deleteUserDevice(user.uid, deviceId)
  }

  return (
    <div className="page">
      <section className="panel">
        <div className="section-title">
          <h2>Device Management</h2>
          <p>จัดการและตรวจสอบอุปกรณ์ dotWatch ทั้งหมด</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="ชื่อ Device เช่น dotWatch 01"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              minWidth: '260px',
            }}
          />

          <button
            onClick={handleAddDevice}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            + เพิ่ม Device
          </button>
        </div>

        {devices.length === 0 ? (
          <p>ยังไม่มี Device</p>
        ) : (
          <div className="device-grid">
            {devices.map((device) => (
              <div key={device.id} style={{ position: 'relative' }}>
                <DeviceCard device={device} />

                <button
                  onClick={() => handleDeleteDevice(device.id)}
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  ลบ Device
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Devices