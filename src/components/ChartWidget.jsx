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

const RANGE_OPTIONS = [
  { label: 'วันนี้', value: 'today' },
  { label: 'เมื่อวาน', value: 'yesterday' },
  { label: '7 วัน', value: '7d' },
  { label: '30 วัน', value: '30d' },
]

function getDateRange(range) {
  const now = new Date()

  if (range === 'today') {
    const start = new Date()
    start.setHours(0, 0, 0, 0)

    const end = new Date()
    end.setHours(23, 59, 59, 999)

    return { startTime: start.getTime(), endTime: end.getTime() }
  }

  if (range === 'yesterday') {
    const start = new Date()
    start.setDate(start.getDate() - 1)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setHours(23, 59, 59, 999)

    return { startTime: start.getTime(), endTime: end.getTime() }
  }

  if (range === '7d') {
    return {
      startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
      endTime: Date.now(),
    }
  }

  if (range === '30d') {
    return {
      startTime: Date.now() - 30 * 24 * 60 * 60 * 1000,
      endTime: Date.now(),
    }
  }

  return {
    startTime: now.getTime(),
    endTime: now.getTime(),
  }
}

function formatXAxis(value, range) {
  const date = new Date(value)

  if (range === 'today' || range === 'yesterday') {
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
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

function ChartWidget() {
  const [devices, setDevices] = useState([])
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [timeRange, setTimeRange] = useState('today')
  const [chartData, setChartData] = useState([])

  const { startTime, endTime } = useMemo(() => {
    return getDateRange(timeRange)
  }, [timeRange])

  const selectedDeviceName = useMemo(() => {
    const device = devices.find((item) => item.id === selectedDeviceId)
    return device?.name || selectedDeviceId || 'device'
  }, [devices, selectedDeviceId])

  const xTicks = useMemo(() => {
    if (timeRange === 'today' || timeRange === 'yesterday') {
      return makeDayTicks(startTime, endTime)
    }

    return undefined
  }, [timeRange, startTime, endTime])

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
    link.download = `${selectedDeviceName}-${timeRange}-history.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <section className="panel">
      <div className="section-title chart-title-row">
        <div>
          <h2>Sensor Activity</h2>
          <p>
            กราฟ History จากค่า Temperature และ Humidity
            {timeRange === 'today' && ' วันนี้ 00:00 - 23:59'}
            {timeRange === 'yesterday' && ' เมื่อวาน 00:00 - 23:59'}
          </p>

          <div className="sensor-stats light-stats">
            <div>
              <p>Temperature</p>
              <strong>
                {latestData ? latestData.temperature.toFixed(1) : '--'}°C
              </strong>
              <span>Realtime</span>
            </div>

            <div>
              <p>Humidity</p>
              <strong>
                {latestData ? latestData.humidity.toFixed(1) : '--'}%
              </strong>
              <span>Realtime</span>
            </div>
          </div>
        </div>

        <div className="chart-toolbar">
          <select
            className="device-select"
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

          <select
            className="range-select"
            value={timeRange}
            onChange={(e) => {
              setTimeRange(e.target.value)
              setChartData([])
            }}
          >
            {RANGE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            className="export-btn"
            onClick={exportCSV}
            disabled={chartData.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="empty-chart">
          รอข้อมูล History จาก Device...
        </div>
      ) : (
        <div className="realtime-chart improved-chart">
          <ResponsiveContainer width="100%" height={330}>
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
                tickFormatter={(value) => formatXAxis(value, timeRange)}
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
                  borderRadius: 12,
                  color: '#0f172a',
                  boxShadow: '0 16px 40px rgba(15,23,42,0.14)',
                }}
                labelStyle={{
                  color: '#475569',
                  fontWeight: 600,
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