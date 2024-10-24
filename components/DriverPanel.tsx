import { useState, useEffect } from 'react'
import { Button } from "./ui/Button"
import io from 'socket.io-client'

let socket

export default function DriverPanel({ ride, onRideUpdate }) {
  const [newRideRequest, setNewRideRequest] = useState(null)

  useEffect(() => {
    socketInitializer()
  }, [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on('newRideAvailable', (rideData) => {
      setNewRideRequest(rideData)
    })
  }

  const handleAccept = async () => {
    const response = await fetch(`/api/rides/${ride.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    })
    const updatedRide = await response.json()
    onRideUpdate(updatedRide)
    setNewRideRequest(null)
  }

  const handleComplete = async () => {
    const response = await fetch(`/api/rides/${ride.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    const updatedRide = await response.json()
    onRideUpdate(updatedRide)
  }

  if (newRideRequest) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">New Ride Request</h2>
        <p>From: {newRideRequest.pickup}</p>
        <p>To: {newRideRequest.dropoff}</p>
        <Button onClick={handleAccept}>Accept Ride</Button>
      </div>
    )
  }

  if (!ride) return <div>No active rides</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Active Ride</h2>
      <p>From: {ride.pickup}</p>
      <p>To: {ride.dropoff}</p>
      <p>Status: {ride.status}</p>
      {ride.status === 'accepted' && (
        <Button onClick={handleComplete}>Complete Ride</Button>
      )}
    </div>
  )
}