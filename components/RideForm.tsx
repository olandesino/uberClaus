import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { useRouter } from 'next/router'
import io from 'socket.io-client'

let socket

export default function RideForm({ onRideRequest }) {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (session) {
      socketInitializer()
    }
  }, [session])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io({
      path: '/api/socketio',
    })

    socket.on('connect', () => {
      console.log('Connected to WebSocket')
    })

    socket.on('connect_error', (err) => {
      console.log('WebSocket connection error:', err)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!session) {
      alert('You must be signed in to request a ride')
      router.push('/auth/signin')
      return
    }
    try {
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pickup, dropoff }),
      })
      if (response.status === 401) {
        alert('Your session has expired. Please sign in again.')
        router.push('/auth/signin')
        return
      }
      const ride = await response.json()
      onRideRequest(ride)
      socket.emit('rideRequested', ride)
    } catch (error) {
      console.error('Error requesting ride:', error)
      alert('An error occurred while requesting the ride. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pickup" className="block text-sm font-medium text-gray-700">Pickup Location</label>
        <Input
          type="text"
          id="pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700">Dropoff Location</label>
        <Input
          type="text"
          id="dropoff"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Request Ride</Button>
    </form>
  )
}