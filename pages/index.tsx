import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Map from '../components/Map'
import RideForm from '../components/RideForm'
import { Button } from "../components/ui/Button"

export default function Home() {
  const { data: session, status } = useSession()
  const [ride, setRide] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Private Ride Share - Customer View</h1>
      <Button onClick={() => signOut()} className="mb-4">Sign out</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <RideForm onRideRequest={setRide} />
          {ride && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold">Ride Status: {ride.status}</h2>
              {ride.driver && <p>Driver: {ride.driver.name}</p>}
            </div>
          )}
        </div>
        <Map ride={ride} />
      </div>
    </div>
  )
}