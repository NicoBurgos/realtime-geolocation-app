import express from 'express'
import logger from 'morgan'
import { createServer } from 'http'
import { Server as socketServer } from 'socket.io'

const app = express()

const server = createServer(app)
const io = new socketServer(server)

//Logger middleware
app.use(logger('dev'))

//Routes
app.use('/', express.static('./client/user'))
app.use('/driver', express.static('./client/driver'))

//Sockets
io.on('connection', (socket) => {
	socket.on('location', (coords) => {
		io.emit('emit location', coords)
	})
	socket.on('disconnect', () => {
		io.emit('truck-disconnected')
	})
})

export default server
