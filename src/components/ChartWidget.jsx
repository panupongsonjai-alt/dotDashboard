const points = [35, 42, 38, 55, 51, 64, 58, 72]

function ChartWidget() {
  return (
    <section className="panel">
      <div className="section-title">
        <h2>Sensor Activity</h2>
        <p>ตัวอย่างกราฟข้อมูลจากอุปกรณ์</p>
      </div>

      <div className="bar-chart">
        {points.map((point, index) => (
          <div key={index} className="bar-wrap">
            <div className="bar" style={{ height: `${point}%` }} />
            <small>{index + 1}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

export default ChartWidget
