import { Server as SocketIOServer } from 'socket.io'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function SocketHandler(req: NextApiRequest, res: NextApiResponse) {
  if ((res.socket as any).server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new SocketIOServer((res.socket as any).server)
    ;(res.socket as any).server.io = io
  }
  res.end()
}