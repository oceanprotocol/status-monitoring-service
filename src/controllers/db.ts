import 'dotenv/config'
import sqlite3 from 'sqlite3'
import { Status } from '../@types/index'

let db

export async function connection() {
  try {
    db = new sqlite3.Database(
      process.env.DB_PATH,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          return console.log('Could not connect to database', err)
        } else {
          console.log('Connected to database')
          db.run(
            `CREATE TABLE IF NOT EXISTS statusHistory(
              network text,
              aquariusStatus text,
              aquariusResponse integer,
              aquariusChain text,
              aquariusVersion text,
              aquariusLatestRelease text,
              aquariusBlock integer,
              aquariusValidQuery text,
              providerStatus text, 
              providerResponse integer,
              providerVersion text,
              providerLatestRelease text,
              subgraphStatus text, 
              subgraphResponse integer,
              subgraphVersion text,
              subgraphLatestRelease text,
              subgraphBlock integer,
              operatorStatus text,
              operatorResponse integer,
              operatorVersion text,
              operatorLatestRelease text,
              operatorEnvironments integer,
              operatorLimitReached text,
              market text, 
              port text,
              faucet text,
              faucetResponse integer,
              faucetEthBalance text,
              faucetEthBalanceSufficient text,
              faucetOceanBalance text,
              oceanBalanceSufficient text,
              lastUpdatedOn integer
              )`
          )
        }
      }
    )
  } catch (err) {
    console.error(err)
  }
}

export async function networkStatus(network: string): Promise<any> {
  try {
    db.all(
      `SELECT 
        network,
        aquariusStatus,
        aquariusResponse,
        aquariusChain,
        aquariusVersion,
        aquariusLatestRelease,
        aquariusBlock,
        aquariusValidQuery,
        providerStatus, 
        providerResponse,
        providerVersion,
        providerLatestRelease,
        subgraphStatus, 
        subgraphResponse,
        subgraphVersion,
        subgraphLatestRelease,
        subgraphBlock,
        operatorStatus,
        operatorResponse,
        operatorVersion,
        operatorLatestRelease,
        operatorEnvironments,
        operatorLimitReached,
        market, 
        port,
        faucet,
        faucetResponse,
        faucetEthBalance,
        faucetEthBalanceSufficient,
        faucetOceanBalance,
        oceanBalanceSufficient,
        lastUpdatedOn FROM statusHistory WHERE network = "${network}" ORDER BY lastUpdatedOn DESC`,
      [],
      function (err, row) {
        if (err) {
          return console.log(err.message)
        }
        console.log('row', row)
        return row
      }
    )
  } catch (err) {
    console.error(err)
  }
}

export async function insert(status: Status) {
  const date = Date.now()
  try {
    db.run(
      `INSERT INTO statusHistory(
        network,
        aquariusStatus,
        aquariusResponse,
        aquariusChain,
        aquariusVersion,
        aquariusLatestRelease,
        aquariusBlock,
        aquariusValidQuery,
        providerStatus, 
        providerResponse,
        providerVersion,
        providerLatestRelease,
        subgraphStatus, 
        subgraphResponse,
        subgraphVersion,
        subgraphLatestRelease,
        subgraphBlock,
        operatorStatus,
        operatorResponse,
        operatorVersion,
        operatorLatestRelease,
        operatorEnvironments,
        operatorLimitReached,
        market, 
        port,
        faucet,
        faucetResponse,
        faucetEthBalance,
        faucetEthBalanceSufficient,
        faucetOceanBalance,
        oceanBalanceSufficient,
        lastUpdatedOn
        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        status.network,
        status.aquarius.status,
        status.aquarius.response,
        status.aquarius.chain,
        status.aquarius.version,
        status.aquarius.latestRelease,
        status.aquarius.block,
        status.provider.status,
        status.provider.response,
        status.provider.version,
        status.aquarius.latestRelease,
        status.subgraph.status,
        status.subgraph.response,
        status.subgraph.version,
        status.subgraph.latestRelease,
        status.subgraph.block,
        status.operatorService.status,
        status.operatorService.response,
        status.operatorService.version,
        status.operatorService.latestRelease,
        status.operatorService.environments,
        status.operatorService.limitReached,
        status.market,
        status.port,
        status.faucet.status,
        status.faucet.ethBalance,
        status.faucet.ethBalanceSufficient,
        status.faucet.oceanBalance,
        status.faucet.oceanBalanceSufficient,
        status.faucet.status,
        1234567890
      ],
      function (err) {
        if (err) {
          return console.log(err.message)
        }
        // get the last insert id
      }
    )
  } catch (err) {
    console.error(err)
  }
}
