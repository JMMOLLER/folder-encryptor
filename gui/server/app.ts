import express, { Express } from 'express'
import expressWs from 'express-ws'
import morgan from 'morgan'
import corsConf from './config/corsConfig'
import wsController from './controllers/webSocket'

const ex: Express = express()
const app = expressWs(ex).app
const port = 8421

app.use(corsConf)
app.use(morgan('dev'))

app.ws('/socket.io', wsController)

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`)
})
