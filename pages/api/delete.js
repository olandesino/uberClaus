const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const socketIo = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = socketIo(server, {
    path: '/api/socketio',
  })

  io.on('connection', (socket) => {
    console.log('A user connected')

    socket.on('rideRequested', (rideData) => {
      console.log('New ride requested:', rideData)
      io.emit('newRideAvailable', rideData)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})