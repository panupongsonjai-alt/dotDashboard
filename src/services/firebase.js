import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  remove,
  query,
  orderByChild,
  startAt,
  endAt,
  limitToLast,
} from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const database = getDatabase(app)

export const listenDeviceData = (uid, deviceId, callback) => {
  const deviceRef = ref(database, `users/${uid}/devices/${deviceId}`)

  return onValue(deviceRef, (snapshot) => {
    callback(snapshot.val())
  })
}

export const listenDeviceHistoryByDate = (
  uid,
  deviceId,
  startTime,
  endTime,
  callback
) => {
  const historyRef = query(
    ref(database, `users/${uid}/deviceHistory/${deviceId}`),
    orderByChild('createdAt'),
    startAt(startTime),
    endAt(endTime),
    limitToLast(3000)
  )

  return onValue(historyRef, (snapshot) => {
    const data = snapshot.val() || {}

    const logs = Object.entries(data)
      .map(([id, value]) => ({
        id,
        ...value,
      }))
      .sort((a, b) => a.createdAt - b.createdAt)

    callback(logs)
  })
}

export const writeDeviceCommand = async (deviceId, command) => {
  return set(ref(database, `commands/${deviceId}`), {
    command,
    createdAt: Date.now(),
  })
}

export const addSensorLog = async (deviceId, payload) => {
  return push(ref(database, `logs/${deviceId}`), {
    ...payload,
    createdAt: Date.now(),
  })
}

export const addUserDevice = async (uid, name) => {
  const devicesRef = ref(database, `users/${uid}/devices`)
  const newDeviceRef = push(devicesRef)

  return set(newDeviceRef, {
    name,
    deviceId: newDeviceRef.key,
    status: 'offline',
    createdAt: Date.now(),
  })
}

export const listenUserDevices = (uid, callback) => {
  const devicesRef = ref(database, `users/${uid}/devices`)

  return onValue(devicesRef, (snapshot) => {
    const data = snapshot.val() || {}

    const devices = Object.entries(data).map(([id, value]) => ({
      id,
      ...value,
    }))

    callback(devices)
  })
}

export const deleteUserDevice = async (uid, deviceId) => {
  return remove(ref(database, `users/${uid}/devices/${deviceId}`))
}

export default app