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
  listenDeviceData,
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
        setSelectedDeviceId(deviceList[0].deviceId || deviceList[0].id)
      }
    })

    return () => unsubscribe()
  }, [selectedDeviceId])

  useEffect(() => {
    if (!selectedDeviceId) return

    const unsubscribe = listenDeviceData(selectedDeviceId, (data) => {
      if (!data) return

      const now = new Date()

      const point = {
        time: now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        temperature: Number(data.temperature ?? 0),
        humidity: Number(data.humidity ?? 0),
      }

      setCurrentData({
        temperature: point.temperature,
        humidity: point.humidity,
        status: data.status || 'offline',
      })

      setChartData((prev) => {
        const next = [...prev, point]
        return next.slice(-15)
      })
    })

    return () => unsubscribe()
  }, [selectedDeviceId])

  return (
    <section className="panel">
      <div className="section-title chart-title-row">
        <div>
          <h2>Sensor Activity</h2>
          <p>กราฟ Realtime จากค่า Temperature และ Humidity</p>
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
              <option
                key={device.id}
                value={device.deviceId || device.id}
              >
                {device.name || device.id}
              </option>
            ))
          )}
        </select>
      </div>

      {currentData && (
        <div className="sensor-stat-grid">
          <div className="sensor-stat-card">
            <span>Temperature</span>
            <strong>{currentData.temperature}°C</strong>
          </div>

          <div className="sensor-stat-card">
            <span>Humidity</span>
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
          รอข้อมูล Sensor จาก Device...
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