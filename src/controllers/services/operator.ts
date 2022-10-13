import fetch from 'cross-fetch'
import latestRelease from '../utils/github'
import { IOperatorStatus, State } from '../../@types'

export default async function operatorStatus(
  chainId: string
): Promise<IOperatorStatus> {
  const status: IOperatorStatus = { limitReached: false }
  const response = await fetch(`https://stagev4.c2d.oceanprotocol.com`)
  const operatorStatus = await response.json()
  const c2dEnvironment = process.env.C2D_ENVIRONMENTS
    ? process.env.C2D_ENVIRONMENTS
    : '2'
  status.response = response.status
  status.version = operatorStatus.version

  status.latestRelease = await latestRelease('operator-service')

  const environment = await fetch(
    `https://stagev4.c2d.oceanprotocol.com/api/v1/operator/environments?chainId=${chainId}`
  )
  const environmentData = await environment.json()
  status.environments = environmentData.length

  environmentData.forEach((environment) => {
    if (environment.currentJobs >= environment.maxJobs)
      return (status.limitReached = true)
  })

  if (status.response !== 200 || status.environments < Number(c2dEnvironment))
    status.status = State.Down
  else if (
    status.version !== status.latestRelease ||
    status.limitReached === true
  )
    status.status = State.Warning
  else status.status = State.Up

  return status
}
