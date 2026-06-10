import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import {
  auth,
  listenUserDevices,
  listenDeviceHistoryByDate,
} from '../services/firebase'

function getTodayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return {
    startTime: start.getTime(),
    endTime: end.getTime(),
  }
}

function formatXAxis(value) {
  return new Date(value).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function makeDayTicks(startTime, endTime) {
  const ticks = []
  const start = new Date(startTime)
  start.setHours(0, 0, 0, 0)

  for (let hour = 0; hour <= 21; hour += 3) {
    const tick = new Date(start)
    tick.setHours(hour, 0, 0, 0)
    ticks.push(tick.getTime())
  }

  ticks.push(endTime)
  return ticks
}

function getAverage(data, key) {
  if (data.length === 0) return '--'
  const total = data.reduce((sum, item) => sum + Number(item[key] || 0), 0)
  return (total / data.length).toFixed(1)
}

function ChartWidget() {
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [chartData, setChartData] = useState([])

  const { startTime, endTime } = useMemo(() => getTodayRange(), [])
  const xTicks = useMemo(() => makeDayTicks(startTime, endTime), [startTime, endTime])

  const selectedDeviceName = useMemo(() => {
    const device = devices.find((item) => item.id === selectedDeviceId)
    return device?.name || selectedDeviceId || 'device'
  }, [devices, selectedDeviceId])

  const latestData = chartData[chartData.length - 1]

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

    const unsubscribe = listenDeviceHistoryByDate(
      user.uid,
      selectedDeviceId,
      startTime,
      endTime,
      (logs) => {
        const points = logs
          .map((item) => ({
            timestamp: Number(item.createdAt),
            datetime: new Date(item.createdAt).toLocaleString('th-TH'),
            temperature: Number(item.temperature ?? 0),
            humidity: Number(item.humidity ?? 0),
          }))
          .sort((a, b) => a.timestamp - b.timestamp)

        setChartData(points)
      }
    )

    return () => unsubscribe()
  }, [selectedDeviceId, startTime, endTime])

  const exportCSV = () => {
    if (chartData.length === 0) return

    const headers = ['datetime', 'temperature', 'humidity']
    const rows = chartData.map((row) => [
      row.datetime,
      row.temperature,
      row.humidity,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${selectedDeviceName}-today-history.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="panel">
      <div className="section-title chart-title-row">
        <div>
          <h2>Sensor Activity</h2>
          <p>กราฟ History จากค่า Temperature และ Humidity วันนี้ 00:00 - 23:59</p>

          <div className="sensor-stats light-stats">
            <div>
              <p>Temperature</p>
              <strong>{latestData ? latestData.temperature.toFixed(1) : '--'}°C</strong>
              <span>Avg {getAverage(chartData, 'temperature')}°C</span>
            </div>

            <div>
              <p>Humidity</p>
              <strong>{latestData ? latestData.humidity.toFixed(1) : '--'}%</strong>
              <span>Avg {getAverage(chartData, 'humidity')}%</span>
            </div>
          </div>
        </div>

        <div className="chart-toolbar clean-toolbar">
          <select
            className="device-select clean-select"
            value={selectedDeviceId}
            onChange={(e) => {
              setSelectedDeviceId(e.target.value)
              setChartData([])
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

          <button
            className="csv-export-btn"
            type="button"
            onClick={exportCSV}
            disabled={chartData.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="empty-chart">รอข้อมูล History จาก Device...</div>
      ) : (
        <div className="realtime-chart improved-chart">
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 24, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="humidityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.16} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#e2e8f0"
                strokeDasharray="6 6"
                opacity={0.9}
              />

              <XAxis
                dataKey="timestamp"
                type="number"
                domain={[startTime, endTime]}
                ticks={xTicks}
                tickFormatter={formatXAxis}
                tickLine={false}
                axisLine={false}
                minTickGap={26}
                stroke="#64748b"
                fontSize={12}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={42}
                stroke="#64748b"
                fontSize={12}
              />

              <Tooltip
                cursor={{
                  stroke: '#94a3b8',
                  strokeDasharray: '4 4',
                }}
                contentStyle={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  color: '#0f172a',
                  boxShadow: '0 18px 45px rgba(15,23,42,0.16)',
                }}
                labelStyle={{
                  color: '#475569',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleString('th-TH')
                }
              />

              <Area
                type="monotone"
                dataKey="temperature"
                name="Temperature °C"
                stroke="#ef4444"
                fill="url(#temperatureFill)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />

              <Area
                type="monotone"
                dataKey="humidity"
                name="Humidity %"
                stroke="#2563eb"
                fill="url(#humidityFill)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default ChartWidget