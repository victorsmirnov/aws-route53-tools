import type { HostedZone } from '@aws-sdk/client-route-53'
import chalk from 'chalk'
import ora from 'ora'
import { isPrivate, listHostedZones } from '../aws-clients/route53.js'

export async function loadZones (): Promise<HostedZone[]> {
  const spinner = ora(chalk.dim('Fetching hosted zones  ...')).start()
  const hostedZones = (await listHostedZones()).filter(zone => !isPrivate(zone))
  spinner.succeed(chalk.dim(`Fetched ${hostedZones.length} hosted zones.`))
  return hostedZones
}
