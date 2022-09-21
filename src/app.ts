import express from 'express'
import cors from 'cors'
import cron from 'node-cron'

import indexRouter from './routes/index'
import { connection } from './controllers/db'
import monitor from './controllers'

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())
app.use('/', indexRouter)

app.listen(port, async () => {
  await connection()
  console.log(`Price Request App listening at http://localhost:${port}`)
})

cron.schedule(`*/${process.env.INTERVAL} * * * *`, () => {
  const networks = JSON.parse(process.env.NETWORKS)
  networks.forEach((network) => {
    console.log(
      `Monitor status for ${network}. Running task every ${process.env.INTERVAL} minutes`
    )
    monitor(network)
  })
})

export default app
