import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Map from '../components/Map'
import RideForm from '../components/RideForm'
import { Button } from "../components/ui/Button"
import Layout from '../components/Layout'
import { Ride } from '../components/DriverPanel'

export default function Home() {
  const { data: session, status } = useSession()
  const [ride, setRide] = useState<Ride | null>(null)

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
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
    </Layout>
  )
}