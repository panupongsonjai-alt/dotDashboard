export const mockDevices = [
  {
    id: 'dotwatch-001',
    name: 'dotWatch Device 001',
    status: 'online',
    battery: 87,
    temperature: 29.4,
    humidity: 62,
    lastSeen: 'Just now',
  },
  {
    id: 'dotwatch-002',
    name: 'dotWatch Device 002',
    status: 'offline',
    battery: 44,
    temperature: 28.1,
    humidity: 59,
    lastSeen: '18 minutes ago',
  },
]

export const getDevices = async () => {
  return mockDevices
}
