import { useEffect, useState } from 'react'
import DeviceCard from '../components/DeviceCard.jsx'
import {
  auth,
  addUserDevice,
  listenUserDevices,
  deleteUserDevice,
  updateDeviceName,
} from '../services/firebase'

function Device() {
  const [devices, setDevices] = useState([])
  const [deviceName, setDeviceName] = useState('')
  const [editingDeviceId, setEditingDeviceId] = useState(null)
  const [editingName, setEditingName] = useState('')

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

  const handleSaveDeviceName = async (deviceId) => {
    const user = auth.currentUser

    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อน')
      return
    }

    if (!editingName.trim()) {
      alert('กรุณากรอกชื่อ Device')
      return
    }

    await updateDeviceName(user.uid, deviceId, editingName)

    setEditingDeviceId(null)
    setEditingName('')
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

        <div className="device-add-row">
          <input
            type="text"
            placeholder="ชื่อ Device เช่น dotWatch 01"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddDevice()
            }}
          />

          <button
            className="primary-button device-add-btn"
            onClick={handleAddDevice}
          >
            + เพิ่ม Device
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="empty-device">
            <h3>ยังไม่มี Device</h3>
            <p>เพิ่มอุปกรณ์ dotWatch เพื่อเริ่มติดตามข้อมูล Sensor</p>
          </div>
        ) : (
          <div className="device-grid">
            {devices.map((device) => (
              <div key={device.id} className="device-list-item">
                {editingDeviceId === device.id && (
                  <div className="device-edit-row">
                    <input
                      className="device-edit-input"
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="ชื่อ Device"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveDeviceName(device.id)
                        }

                        if (e.key === 'Escape') {
                          setEditingDeviceId(null)
                          setEditingName('')
                        }
                      }}
                    />

                    <button
                      className="save-btn"
                      onClick={() => handleSaveDeviceName(device.id)}
                    >
                      บันทึก
                    </button>

                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setEditingDeviceId(null)
                        setEditingName('')
                      }}
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}

                <DeviceCard device={device} />

                <div className="device-actions">
                  {editingDeviceId !== device.id && (
                    <button
                      className="rename-btn"
                      onClick={() => {
                        setEditingDeviceId(device.id)
                        setEditingName(device.name || '')
                      }}
                    >
                      แก้ไขชื่อ
                    </button>
                  )}

                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteDevice(device.id)}
                  >
                    ลบ Device
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Device