import assert from 'node:assert'
import chalk from 'chalk'
import { loadCloudFrontAliases } from '../loaders/cloud-front-aliases.js'
import { loadDistributions } from '../loaders/distributions.js'
import { loadZones } from '../loaders/zones.js'
import { difference, printSet } from '../tools/set-utils.js'

export async function checkCloudFront (): Promise<void> {
  const zones = await loadZones()

  const cloudFrontAliases = await loadCloudFrontAliases(zones)

  const distributions = await loadDistributions()

  for (const distribution of distributions) {
    assert(distribution.DomainName !== undefined, 'Distribution domain name is missing.')

    // Names end with dot in Route 53 and don't in CloudFront.
    const domainName = `${distribution.DomainName}.`

    if (!cloudFrontAliases.has(domainName)) {
      console.log(chalk.red(`CloudFront distribution ${distribution.DomainName} is not in Route 53.`))
      continue
    }

    const distributionAliases = new Set<string>((distribution.Aliases?.Items ?? []).map(item => `${item}.`))
    const dnsAliases = cloudFrontAliases.get(domainName) ?? new Set<string>()

    const missingAliases = difference(dnsAliases, distributionAliases)

    if (missingAliases.size > 0) {
      console.log(chalk.red(`CloudFront distribution ${distribution.DomainName} is missing aliases ${printSet(missingAliases)}.`))
    }
  }
}
