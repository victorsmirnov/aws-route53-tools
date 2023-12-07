import type { DistributionSummary } from '@aws-sdk/client-cloudfront'
import chalk from 'chalk'
import ora from 'ora'
import { listDistributions } from '../aws-clients/cloud-front.js'

export async function loadDistributions (): Promise<DistributionSummary[]> {
  const spinner = ora(chalk.dim('Fetching CloudFront Distributions  ...')).start()
  const distributions = await listDistributions()
  spinner.succeed(chalk.dim(`Fetched ${distributions.length} CloudFront Distributions.`))
  return distributions
}
