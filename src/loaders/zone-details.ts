import type { HostedZone } from '@aws-sdk/client-route-53'
import chalk from 'chalk'
import assert from 'node:assert'
import { resolveNs } from 'node:dns/promises'
import ora from 'ora'
import { getNsRecord } from '../aws-clients/route53.js'

export interface ZoneDetails {
  readonly id: string
  readonly name: string
  readonly resolverServers: Set<string>
  readonly route53Servers: Set<string>
}

export async function loadZoneDetails (hostedZones: HostedZone[]): Promise<ZoneDetails[]> {
  const zones: ZoneDetails[] = []

  const spinner = ora(chalk.dim('Fetching NS records ...')).start()
  for (const [index, zone] of hostedZones.entries()) {
    assert(zone.Id !== undefined, 'Zone id is missing.')
    assert(zone.Name !== undefined, 'Zone name is missing.')

    zones.push({
      id: zone.Id,
      name: zone.Name,
      resolverServers: await resolverNsRecord(zone.Name),
      route53Servers: await getNsRecord(zone.Id)
    })

    spinner.text = chalk.dim(`Fetching NS records ${index + 1}/${hostedZones.length} ...`)
  }
  spinner.succeed(chalk.dim('Fetched NS records.'))
  return zones
}

async function resolverNsRecord (zoneName: string): Promise<Set<string>> {
  try {
    return new Set<string>(await resolveNs(zoneName))
  } catch (error) {
    return new Set<string>()
  }
}
