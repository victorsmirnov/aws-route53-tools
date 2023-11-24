import chalk from 'chalk'
import { resolveNs } from 'node:dns/promises'
import type { HostedZoneDetails } from './list-hosted-zones.js'
import { listHostedZones } from './list-hosted-zones.js'
import { symmetricDifference } from './set-utils.js'

interface ZoneDetails {
  readonly hostedZone: HostedZoneDetails
  readonly nameServers: Set<string>
}

export async function checkNsRecords (): Promise<void> {
  const log = console.log

  log(chalk.dim('Fetching hosted zones from the Route53 API ...'))

  const hostedZones = await listHostedZones()
  const zones: ZoneDetails[] = []

  log(chalk.dim('Fetching NS records for the hosted zones ...'))
  for (const zone of hostedZones) {
    zones.push({ hostedZone: zone, nameServers: await queryNsServers(zone.name) })
  }

  let errorCount = 0
  for (const zone of zones) {
    const differ = symmetricDifference(zone.nameServers, zone.hostedZone.nameServers).size > 0

    if (differ) {
      errorCount++
      log(chalk.red(`Zone: ${zone.hostedZone.name} (${zone.hostedZone.zoneId}) has different NS records.`))
      log(chalk.dim(`DNS resolver: ${formatNsServers(zone.nameServers)}`))
      log(chalk.dim(`Route 53: ${formatNsServers(zone.hostedZone.nameServers)}`))
    }
  }

  log(chalk.green(`Checked ${zones.length} zones.`))
  if (errorCount > 0) {
    log(chalk.red(`Found ${errorCount} zones with different NS records.`))
  }
}

async function queryNsServers (zoneName: string): Promise<Set<string>> {
  try {
    return new Set<string>(await resolveNs(zoneName))
  } catch (error) {
    return new Set<string>()
  }
}

function formatNsServers (servers: Set<string>): string {
  return servers.size === 0 ? 'none' : Array.from(servers).join(', ')
}
