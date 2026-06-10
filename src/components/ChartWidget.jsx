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
  const values = data
    .map((item) => Number(item[key]))
    .filter((value) => Number.isFinite(value))

  if (values.length === 0) return '--'

  const total = values.reduce((sum, value) => sum + value, 0)
  return (total / values.length).toFixed(1)
}

function ChartWidget() {
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [chartData, setChartData] = useState([])

  const { startTime, endTime } = useMemo(() => getTodayRange(), [])

  const xTicks = useMemo(
    () => makeDayTicks(startTime, endTime),
    [startTime, endTime]
  )

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
            temperature:
              item.temperature != null
                ? Number(Number(item.temperature).toFixed(1))
                : null,
            humidity:
              item.humidity != null
                ? Number(Number(item.humidity).toFixed(1))
                : null,
          }))
          .filter((item) => item.timestamp)
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
      row.temperature != null ? Number(row.temperature).toFixed(1) : '',
      row.humidity != null ? Number(row.humidity).toFixed(1) : '',
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
    <section className="realtime-graph-section">
      <div className="realtime-graph-card">
        <div className="realtime-graph-header">
          <div className="realtime-graph-title">
            <h2>Real Time Graph</h2>
            <p>กราฟแสดงแสดงข้อมูลในวันและเวลา ณ ปัจจุบัน</p>
          </div>

          <div className="realtime-graph-stats">
            <div className="realtime-stat">
              <p>Temperature</p>
              <strong>
                {latestData?.temperature != null
                  ? `${latestData.temperature.toFixed(1)}°C`
                  : '--'}
              </strong>
              <span>Avg {getAverage(chartData, 'temperature')}°C</span>
            </div>

            <div className="realtime-stat">
              <p>Humidity</p>
              <strong>
                {latestData?.humidity != null
                  ? `${latestData.humidity.toFixed(1)}%`
                  : '--'}
              </strong>
              <span>Avg {getAverage(chartData, 'humidity')}%</span>
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="realtime-chart-box empty-chart">
            รอข้อมูล History จาก Device...
          </div>
        ) : (
          <div className="realtime-chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 12, right: 24, left: 0, bottom: 8 }}
              >
                <defs>
                  <linearGradient
                    id="temperatureFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="humidityFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  width={42}
                  stroke="#64748b"
                  fontSize={12}
                />

                <Tooltip
                  formatter={(value, name) => [
                    value != null ? Number(value).toFixed(1) : '--',
                    name,
                  ]}
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
                  isAnimationActive={false}
                  connectNulls
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
                  isAnimationActive={false}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="realtime-graph-actions">
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
    </section>
  )
}

export default ChartWidget