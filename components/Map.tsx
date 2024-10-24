import React, { useEffect, useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const center = {
  lat: 40.7128,
  lng: -74.0060
}

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface Ride {
  pickup: LatLngLiteral;
  dropoff: LatLngLiteral;
}

interface MapProps {
  ride: Ride | null;
}

export default function Map({ ride }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)

  useEffect(() => {
    if (isLoaded && ride && ride.pickup && ride.dropoff) {
      const directionsService = new google.maps.DirectionsService()
      directionsService.route(
        {
          origin: ride.pickup,
          destination: ride.dropoff,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result)
          }
        }
      )
    }
  }, [isLoaded, ride])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  if (!isLoaded) return <div>Loading map...</div>

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {ride && ride.pickup && <Marker position={ride.pickup} label="P" />}
      {ride && ride.dropoff && <Marker position={ride.dropoff} label="D" />}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  )
}