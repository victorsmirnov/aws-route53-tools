import type { HostedZone } from '@aws-sdk/client-route-53'
import chalk from 'chalk'
import assert from 'node:assert'
import ora from 'ora'
import { listCloudFrontAliases } from '../aws-clients/route53.js'

// Map CloudFront distribution domain name to all DNS names pointing to it.
// Note: all DNS names end with dot in Route 53.
export async function loadCloudFrontAliases (zones: HostedZone[]): Promise<Map<string, Set<string>>> {
  const aliases = new Map<string, Set<string>>()
  const spinner = ora(chalk.dim('Fetching CloudFront alias records ...')).start()
  for (const [index, zone] of zones.entries()) {
    assert(zone.Id !== undefined, 'Zone id is missing.')

    const records = await listCloudFrontAliases(zone.Id)
    records.forEach(record => {
      assert(record.Name !== undefined, 'Record name is missing.')
      assert(record.AliasTarget?.DNSName !== undefined, 'Alias target DNS name is missing.')

      const cloudFront = record.AliasTarget.DNSName
      aliases.set(cloudFront, (aliases.get(cloudFront) ?? new Set()).add(record.Name))
    })
    spinner.text = chalk.dim(`Fetching CloudFront alias records ${index + 1}/${zones.length} ...`)
  }
  spinner.succeed(chalk.dim('Fetched CloudFront alias records.'))
  return aliases
}
