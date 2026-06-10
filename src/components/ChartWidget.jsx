import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import {
  auth,
  listenUserDevices,
  listenDeviceHistory24h,
} from '../services/firebase'

function ChartWidget() {
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [chartData, setChartData] = useState([])
  const [currentData, setCurrentData] = useState(null)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const unsubscribe = listenUserDevices(user.uid, (deviceList) => {
      setDevices(deviceList)

      if (!selectedDeviceId && deviceList.length > 0) {
        setSelectedDeviceId(deviceList[0].id)
      }
    })

    return () => unsubscribe()
  }, [selectedDeviceId])

  useEffect(() => {
    const user = auth.currentUser
    if (!user || !selectedDeviceId) return

    const unsubscribe = listenDeviceHistory24h(
      user.uid,
      selectedDeviceId,
      (logs) => {
        const points = logs.map((item) => ({
          time: new Date(item.createdAt).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          temperature: Number(item.temperature ?? 0),
          humidity: Number(item.humidity ?? 0),
        }))

        setChartData(points)

        if (logs.length > 0) {
          const latest = logs[logs.length - 1]

          setCurrentData({
            temperature: latest.temperature,
            humidity: latest.humidity,
            status: latest.status || 'online',
          })
        }
      }
    )

    return () => unsubscribe()
  }, [selectedDeviceId])

  return (
    <section className="panel">
      <div className="section-title chart-title-row">
        <div>
          <h2>Sensor Activity</h2>
          <p>กราฟย้อนหลัง 24 ชั่วโมง จากค่า Temperature และ Humidity</p>
        </div>

        <select
          className="device-select"
          value={selectedDeviceId}
          onChange={(e) => {
            setSelectedDeviceId(e.target.value)
            setChartData([])
            setCurrentData(null)
          }}
        >
          {devices.length === 0 ? (
            <option value="">ยังไม่มี Device</option>
          ) : (
            devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name || device.id}
              </option>
            ))
          )}
        </select>
      </div>

      {currentData && (
        <div className="sensor-stat-grid">
          <div className="sensor-stat-card">
            <span>Temperature ล่าสุด</span>
            <strong>{currentData.temperature}°C</strong>
          </div>

          <div className="sensor-stat-card">
            <span>Humidity ล่าสุด</span>
            <strong>{currentData.humidity}%</strong>
          </div>

          <div className="sensor-stat-card">
            <span>Status</span>
            <strong
              className={
                currentData.status === 'online'
                  ? 'sensor-online'
                  : 'sensor-offline'
              }
            >
              {currentData.status}
            </strong>
          </div>
        </div>
      )}

      {chartData.length === 0 ? (
        <div className="empty-chart">
          รอข้อมูล History จาก Device...
        </div>
      ) : (
        <div className="realtime-chart">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="temperature"
                name="Temp °C"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="humidity"
                name="Humidity %"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default ChartWidget