import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { v4 as uuidv4 } from 'uuid'
import { getRides, addRide, updateRide } from '../../lib/db'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const rides = getRides()
    res.status(200).json(rides)
  } else if (req.method === 'POST') {
    const { pickup, dropoff } = req.body
    const newRide = {
      id: uuidv4(),
      customerId: session.user.id,
      pickup,
      dropoff,
      status: 'requested',
    }
    addRide(newRide)
    res.status(201).json(newRide)
  } else if (req.method === 'PUT') {
    const { id } = req.query
    const { status } = req.body
    const updatedRide = updateRide(id as string, { status, driverId: session.user.id })
    if (updatedRide) {
      res.status(200).json(updatedRide)
    } else {
      res.status(404).json({ error: 'Ride not found' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}