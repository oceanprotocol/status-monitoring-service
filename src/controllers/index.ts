import { Response } from 'express'
import 'dotenv/config'

import { insert } from './db'
import aquariusStatus from './services/aquarius'
import marketStatus from './services/market'
import portStatus from './services/port'
import providerStatus from './services/provider'
import subgraphStatus from './services/subgraph'
import faucetStatus from './services/faucet'
import { Status, Network } from '../@types/index'

export default async function monitor(res: Response) {
  const networks = JSON.parse(process.env.NETWORKS)
  const market = await marketStatus()
  const port = await portStatus()
  const aquarius = await aquariusStatus()
  try {
    for (let i = 0; i < networks.length; i++) {
      const network: Network = networks[i]
      const status: Status = { network: network.name }

      if (networks[i].test && networks[i].infuraId)
        status.faucet = await faucetStatus(network)
      else
        status.faucet = {
          status: 'N/A',
          response: 'N/A',
          ethBalance: 'N/A',
          ethBalanceSufficient: 'N/A',
          oceanBalance: 'N/A',
          oceanBalanceSufficient: 'N/A'
        }

      status.provider = await providerStatus(network.name)
      status.subgraph = await subgraphStatus(network)
      status.market = market
      status.port = port
      status.aquarius = aquarius
      console.log({ status })
      // Update DB
      await insert(status)
    }

    res.send({ response: 'Database has been updated' })
  } catch (error) {
    console.log('error: ', error)
    res.send(error)
  }
}
