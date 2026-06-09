import { Battery, Droplets, Thermometer } from 'lucide-react'

function DeviceCard({ device }) {
  return (
    <article className="device-card">
      <div className="device-header">
        <div>
          <h3>{device.name}</h3>
          <p>{device.id}</p>
        </div>
        <span className={device.status === 'online' ? 'status online' : 'status offline'}>
          {device.status}
        </span>
      </div>

      <div className="metrics-grid">
        <div className="metric">
          <Thermometer size={18} />
          <span>{device.temperature}°C</span>
          <small>Temp</small>
        </div>
        <div className="metric">
          <Droplets size={18} />
          <span>{device.humidity}%</span>
          <small>Humidity</small>
        </div>
        <div className="metric">
          <Battery size={18} />
          <span>{device.battery}%</span>
          <small>Battery</small>
        </div>
      </div>

      <p className="last-seen">Last seen: {device.lastSeen}</p>
    </article>
  )
}

export default DeviceCard
