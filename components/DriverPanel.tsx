import React, { useEffect, useState } from 'react'
import { Button } from "./ui/Button"

interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface Ride {
  id: string;
  pickup: LatLngLiteral;
  dropoff: LatLngLiteral;
  status: string;
  driver?: {
    name: string;
  };
}

interface DriverPanelProps {
  ride: Ride | null;
  onRideUpdate: (ride: Ride | null) => void;
}

export default function DriverPanel({ ride, onRideUpdate }: DriverPanelProps) {
  const [pickupAddress, setPickupAddress] = useState<string>('')
  const [dropoffAddress, setDropoffAddress] = useState<string>('')

  useEffect(() => {
    if (ride) {
      getAddressFromCoords(ride.pickup, setPickupAddress)
      getAddressFromCoords(ride.dropoff, setDropoffAddress)
    }
  }, [ride])

  const getAddressFromCoords = (coords: LatLngLiteral, setAddress: React.Dispatch<React.SetStateAction<string>>) => {
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setAddress(results[0].formatted_address)
      } else {
        console.error("Geocoder failed due to: " + status)
        setAddress(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`)
      }
    })
  }

  const handleAccept = async () => {
    if (!ride) return;
    const response = await fetch(`/api/rides/${ride.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    })
    const updatedRide = await response.json()
    onRideUpdate(updatedRide)
  }

  const handleComplete = async () => {
    if (!ride) return;
    const response = await fetch(`/api/rides/${ride.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' }),
    })
    const updatedRide = await response.json()
    onRideUpdate(updatedRide)
  }

  if (!ride) return <div>No active rides</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Active Ride</h2>
      <p>From: {pickupAddress}</p>
      <p>To: {dropoffAddress}</p>
      <p>Status: {ride.status}</p>
      {ride.status === 'requested' && (
        <Button onClick={handleAccept}>Accept Ride</Button>
      )}
      {ride.status === 'accepted' && (
        <Button onClick={handleComplete}>Complete Ride</Button>
      )}
    </div>
  )
}