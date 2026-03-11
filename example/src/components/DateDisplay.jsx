import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export function DateDisplay() {
  const [now, setNow] = useState(dayjs())

  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="card">
      <h3>Current Time</h3>
      <p className="time">{now.format('HH:mm:ss')}</p>
      <p className="date">{now.format('YYYY-MM-DD dddd')}</p>
    </div>
  )
}
