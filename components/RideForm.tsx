import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { useRouter } from 'next/router'
import io, { Socket } from 'socket.io-client'
import { Ride } from "./DriverPanel"

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface RideFormProps {
  onRideRequest: (ride: Ride | null) => void;
}

let socket: Socket | null = null;

export default function RideForm({ onRideRequest }: RideFormProps) {
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [pickupCoords, setPickupCoords] = useState<LatLngLiteral | null>(null)
  const [dropoffCoords, setDropoffCoords] = useState<LatLngLiteral | null>(null)
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const pickupAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const dropoffAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    if (session) {
      socketInitializer()
    }
  }, [session])

  useEffect(() => {
    if (window.google && window.google.maps) {
      pickupAutocompleteRef.current = new google.maps.places.Autocomplete(
        document.getElementById('pickup') as HTMLInputElement,
        { types: ['geocode'] }
      )
      dropoffAutocompleteRef.current = new google.maps.places.Autocomplete(
        document.getElementById('dropoff') as HTMLInputElement,
        { types: ['geocode'] }
      )

      pickupAutocompleteRef.current.addListener('place_changed', () => {
        const place = pickupAutocompleteRef.current?.getPlace()
        if (place && place.geometry && place.geometry.location) {
          setPickup(place.formatted_address || '')
          setPickupCoords({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          })
        }
      })

      dropoffAutocompleteRef.current.addListener('place_changed', () => {
        const place = dropoffAutocompleteRef.current?.getPlace()
        if (place && place.geometry && place.geometry.location) {
          setDropoff(place.formatted_address || '')
          setDropoffCoords({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          })
        }
      })
    }
  }, [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io({
      path: '/api/socketio',
    })

    socket.on('connect', () => {
      console.log('Connected to WebSocket')
    })

    socket.on('connect_error', (err: Error) => {
      console.log('WebSocket connection error:', err)
    })
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const geocoder = new google.maps.Geocoder()
          const latlng = { lat: latitude, lng: longitude }
          
          geocoder.geocode({ location: latlng }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              setPickup(results[0].formatted_address)
              setPickupCoords(latlng)
              setUseCurrentLocation(true)
            } else {
              console.error("Geocoder failed due to: " + status)
              alert("Unable to get current address. Please enter manually.")
            }
          })
        },
        (error) => {
          console.error("Error getting current location:", error)
          alert("Unable to get current location. Please enter manually.")
        }
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session) {
      alert('You must be signed in to request a ride')
      router.push('/auth/signin')
      return
    }
    if (!pickupCoords || !dropoffCoords) {
      alert('Please select valid pickup and dropoff locations')
      return
    }
    try {
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          pickup: pickupCoords,
          dropoff: dropoffCoords
        }),
      })
      if (response.status === 401) {
        alert('Your session has expired. Please sign in again.')
        router.push('/auth/signin')
        return
      }
      const ride = await response.json()
      onRideRequest(ride)
      if (socket) {
        socket.emit('rideRequested', ride)
      }
    } catch (error) {
      console.error('Error requesting ride:', error)
      alert('An error occurred while requesting the ride. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pickup" className="block text-sm font-medium text-gray-700">Pickup Location</label>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            id="pickup"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            required
            disabled={useCurrentLocation}
            placeholder="Enter pickup address"
          />
          <Button type="button" onClick={getCurrentLocation}>
            Use Current Location
          </Button>
        </div>
      </div>
      <div>
        <label htmlFor="dropoff" className="block text-sm font-medium text-gray-700">Dropoff Location</label>
        <Input
          type="text"
          id="dropoff"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          required
          placeholder="Enter dropoff address"
        />
      </div>
      <Button type="submit">Request Ride</Button>
    </form>
  )
}