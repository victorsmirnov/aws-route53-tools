import chalk from 'chalk'
import { loadZoneDetails } from '../loaders/zone-details.js'
import { loadZones } from '../loaders/zones.js'
import { printSet, symmetricDifference } from '../tools/set-utils.js'

const log = console.log

export async function checkNsRecords (): Promise<void> {
  const zones = await loadZones()

  const zoneDetails = await loadZoneDetails(zones)

  let errorCount = 0
  for (const zone of zoneDetails) {
    const differ = symmetricDifference(zone.resolverServers, zone.route53Servers).size > 0

    if (differ) {
      errorCount++
      log(chalk.red(`Zone: ${zone.name} (${zone.id}) has different NS records.`))
      log(chalk.dim(`DNS resolver: ${printSet(zone.resolverServers)}`))
      log(chalk.dim(`Route 53: ${printSet(zone.route53Servers)}`))
    }
  }

  log(chalk.green(`Checked ${zoneDetails.length} zones.`))
  if (errorCount > 0) {
    log(chalk.red(`Found ${errorCount} zones with different NS records.`))
  }
}
