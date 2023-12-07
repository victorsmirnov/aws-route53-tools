import type { DistributionSummary } from '@aws-sdk/client-cloudfront'
import { CloudFrontClient, ListDistributionsCommand } from '@aws-sdk/client-cloudfront'

// Maybe fix: Hard to test because of the global module variable.
const client = new CloudFrontClient()

export async function listDistributions (marker?: string): Promise<DistributionSummary[]> {
  const command = new ListDistributionsCommand({ Marker: marker })
  const response = await client.send(command)
  const distributions = response.DistributionList?.Items ?? []

  const moreDistributions = (response.DistributionList?.IsTruncated !== undefined && response.DistributionList.IsTruncated)
    ? await listDistributions(response.DistributionList?.NextMarker)
    : []

  return distributions.concat(moreDistributions)
}
