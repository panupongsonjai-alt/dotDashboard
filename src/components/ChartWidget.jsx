import { useEffect, useMemo, useState } from 'react'
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

    return {
      startTime: start.getTime(),
      endTime: end.getTime(),
    }
  }

  if (range === 'yesterday') {
    const start = new Date()
    start.setDate(start.getDate() - 1)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setHours(23, 59, 59, 999)

    return {
      startTime: start.getTime(),
      endTime: end.getTime(),
    }
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
    month: '2-digit',
  })
}

function makeDayTicks(startTime, endTime) {
  const ticks = []
  const start = new Date(startTime)
  start.setHours(0, 0, 0, 0)

  for (let hour = 0; hour <= 23; hour += 3) {
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
        const points = logs.map((item) => ({
          timestamp: Number(item.createdAt),
          datetime: new Date(item.createdAt).toLocaleString('th-TH'),
          temperature: Number(item.temperature ?? 0),
          humidity: Number(item.humidity ?? 0),
        }))

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
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="4 4" vertical={false} />

              <XAxis
                dataKey="timestamp"
                type="number"
                domain={[startTime, endTime]}
                ticks={xTicks}
                tickFormatter={(value) => formatXAxis(value, timeRange)}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
                }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleString('th-TH')
                }
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature °C"
                stroke="#ef4444"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />

              <Line
                type="monotone"
                dataKey="humidity"
                name="Humidity %"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}

export default ChartWidget