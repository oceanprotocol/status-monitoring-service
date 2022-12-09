import fetch from 'cross-fetch'
import { IComponentStatus, INetwork, State } from '../../@types/index'
import {
  getBlockMissmatchError,
  getVersionMissmatchError
} from '../utils/messages'

export default async function eventMonitorStatus(
  network: INetwork,
  currentBlock: number,
  latestRelease: string
): Promise<IComponentStatus> {
  const status: IComponentStatus = {
    name: 'event-monitor',
    status: State.Outage,
    response: 500,
    url: 'https://v4-2.aquarius.oceanprotocol.com/'
  }
  try {
    const response = await fetch('https://v4-2.aquarius.oceanprotocol.com/')
    status.response = response.status
    status.version = (await response.json()).version
    status.latestRelease = latestRelease

    const chainStatus = await fetch(
      `https://v4-2.aquarius.oceanprotocol.com/api/aquarius/chains/status/${network.chainId}`
    )
    const chainStatusData = await chainStatus.json()

    status.block = chainStatusData.last_block
    chainStatusData.version
      ? (status.version = chainStatusData.version)
      : (status.version = 'N/A')

    const blockTolerance = process.env.BLOCK_TOLERANCE
      ? process.env.BLOCK_TOLERANCE
      : '100'

    if (status.response !== 200) {
      status.status = State.Outage
      status.error = response.statusText
    } else if (currentBlock >= status.block + Number(blockTolerance))
      status.status = State.Degraded
    else status.status = State.Normal

    status.statusMessages = []
    if (status.version !== status.latestRelease)
      status.statusMessages.push(
        getVersionMissmatchError(status.version, status.latestRelease)
      )

    if (currentBlock >= status.block + Number(blockTolerance))
      status.statusMessages.push(
        getBlockMissmatchError(status.block.toString(), currentBlock.toString())
      )
  } catch (error) {
    const response = String(error)
    console.log(`eventMonitorStatus error for ${network.name}: ${response} `)
    status.error = response
  }
  return status
}
