import fetch from 'cross-fetch'
import { IComponentStatus, INetwork, State } from '../../@types/index'
import { getVersionMissmatchError } from '../utils/messages'

async function aquariusQuery(): Promise<boolean> {
  const response = await fetch(
    `https://v4-2.aquarius.oceanprotocol.com/api/aquarius/assets/query`,
    {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: `{
        "from": 0,
        "size": 9,
        "query": {
            "bool": {
                "filter": [
                    {
                        "term": {
                            "_index": "aquarius"
                        }
                    },
                    {
                        "term": {
                            "purgatory.state": false
                        }
                    }
                ]
            }
        },
        "sort": {
            "stats.orders": "desc"
        }
      }`
    }
  )
  const data = await response.json()

  if (data.hits.hits.length > 0) return true
  else return false
}

export default async function aquariusStatus(
  networks: INetwork[],
  latestRelease: string
): Promise<IComponentStatus> {
  const status: IComponentStatus = {
    name: 'aquarius',
    status: State.Outage,
    response: 500,
    url: 'https://v4-2.aquarius.oceanprotocol.com/'
  }
  try {
    const response = await fetch('https://v4-2.aquarius.oceanprotocol.com/')
    status.response = response.status
    status.version = (await response.json()).version
    status.latestRelease = latestRelease

    const chainResponse = await fetch(
      'https://v4-2.aquarius.oceanprotocol.com/api/aquarius/chains/list'
    )
    const requiredNetworks = networks.map((x) => x.chainId)
    const responseNetworks = await chainResponse.json()

    requiredNetworks.forEach((requiredNetwork) => {
      if (responseNetworks[requiredNetwork] !== true) {
        status.validChainList = false
      }
    })

    status.validQuery = await aquariusQuery()
    status.response = response.status
    if (status.response !== 200 || !status.validQuery) {
      status.status = State.Outage
      status.error = response.statusText
    } else status.status = State.Normal

    status.statusMessages = []
    if (status.version !== status.latestRelease)
      status.statusMessages.push(
        getVersionMissmatchError(status.version, status.latestRelease)
      )
  } catch (error) {
    const response = String(error)
    console.log('aquariusStatus error: ', response)
    status.error = response
  }
  return status
}
