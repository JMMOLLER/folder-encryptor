import express, { Express } from 'express'
import expressWs from 'express-ws'
import morgan from 'morgan'
import corsConf from './config/corsConfig'
import wsController from './controllers/webSocket'
//========== SERVER ==========
const ex: Express = express()
const app = expressWs(ex).app
const port = 8421
//========== CONFIG ==========
app.use(corsConf)
app.use(morgan('dev'))
//========== ROUTES ==========
app.ws('/socket.io', wsController)
//========== LISTEN ==========
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`)
})
