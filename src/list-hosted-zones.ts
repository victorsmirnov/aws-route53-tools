import assert from 'node:assert'
import type { HostedZone } from '@aws-sdk/client-route-53'
import { GetHostedZoneCommand, ListHostedZonesCommand, Route53Client } from '@aws-sdk/client-route-53'

// Maybe fix: Hard to test because of the global module variable.
const client = new Route53Client()

export interface HostedZoneDetails {
  readonly name: string
  readonly nameServers: Set<string>
  readonly zoneId: string
}

export async function listHostedZones (): Promise<HostedZoneDetails[]> {
  const zoneDetails: HostedZoneDetails[] = []

  const zones = await fetchPublicZones()
  for (const zone of zones) {
    assert(zone.Id !== undefined, 'Zone id is missing.')
    assert(zone.Name !== undefined, 'Zone name is missing.')

    if (zone.Config?.PrivateZone !== undefined && zone.Config?.PrivateZone) continue

    const details = await fetchNameServers(zone.Id)
    zoneDetails.push({ name: zone.Name, nameServers: new Set(details), zoneId: zone.Id })
  }

  return zoneDetails
}

async function fetchPublicZones (nextMarker?: string): Promise<HostedZone[]> {
  const command = new ListHostedZonesCommand({ Marker: nextMarker, MaxItems: 100 })
  const response = await client.send(command)
  const zones = response.HostedZones ?? []
  const moreZones = (response.IsTruncated !== undefined && response.IsTruncated)
    ? await fetchPublicZones(response.NextMarker)
    : []

  return zones.concat(moreZones)
}

async function fetchNameServers (zoneId: string): Promise<string[]> {
  const command = new GetHostedZoneCommand({ Id: zoneId })
  const response = await client.send(command)

  assert(response.DelegationSet !== undefined, `DelegationSet is missing for zone id ${zoneId}.`)

  return response.DelegationSet?.NameServers ?? []
}
