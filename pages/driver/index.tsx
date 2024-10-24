import { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Map from '../../components/Map'
import DriverPanel, { Ride } from '../../components/DriverPanel'
import { Button } from "../../components/ui/Button"
import Layout from '../../components/Layout'
import io from 'socket.io-client'

let socket: any

export default function DriverView() {
  const { data: session, status } = useSession()
  const [activeRide, setActiveRide] = useState<Ride | null>(null)

  useEffect(() => {
    if (status === "authenticated") {
      socketInitializer()
    }
  }, [status])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io({
      path: '/api/socketio',
    })

    socket.on('connect', () => {
      console.log('Connected to WebSocket')
    })

    socket.on('newRideAvailable', (rideData: Ride) => {
      console.log('New ride available:', rideData)
      setActiveRide(rideData)
    })

    socket.on('connect_error', (err: Error) => {
      console.log('WebSocket connection error:', err)
    })
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "unauthenticated") {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Button onClick={() => signIn()}>Sign in</Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Private Ride Share - Driver View</h1>
        <Button onClick={() => signOut()} className="mb-4">Sign out</Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <DriverPanel ride={activeRide} onRideUpdate={setActiveRide} />
          </div>
          <Map ride={activeRide} />
        </div>
      </div>
    </Layout>
  )
}