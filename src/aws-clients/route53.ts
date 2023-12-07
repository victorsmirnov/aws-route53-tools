import assert from 'node:assert'
import type { HostedZone, ResourceRecordSet, RRType } from '@aws-sdk/client-route-53'
import {
  GetHostedZoneCommand,
  ListHostedZonesCommand,
  ListResourceRecordSetsCommand,
  Route53Client
} from '@aws-sdk/client-route-53'

// Maybe fix: Hard to test because of the global module variable.
const client = new Route53Client()

export async function listHostedZones (marker?: string): Promise<HostedZone[]> {
  const command = new ListHostedZonesCommand({ Marker: marker, MaxItems: 100 })
  const response = await client.send(command)
  const zones = response.HostedZones ?? []
  const moreZones = (response.IsTruncated !== undefined && response.IsTruncated)
    ? await listHostedZones(response.NextMarker)
    : []

  return zones.concat(moreZones)
}

export async function listCloudFrontAliases (zoneId: string): Promise<ResourceRecordSet[]> {
  const records = await listRecords(zoneId)

  return records.filter(record => record.Type === 'A' &&
    record.AliasTarget !== undefined && record.AliasTarget.DNSName?.endsWith('.cloudfront.net.'))
}

export async function listRecords (zoneId: string, startRecordIdentifier?: string, startRecordName?: string, startRecordType?: RRType): Promise<ResourceRecordSet[]> {
  const command = new ListResourceRecordSetsCommand({
    HostedZoneId: zoneId,
    StartRecordIdentifier: startRecordIdentifier,
    StartRecordName: startRecordName,
    StartRecordType: startRecordType
  })
  const response = await client.send(command)
  const records = response.ResourceRecordSets ?? []

  const moreRecords = (response.IsTruncated !== undefined && response.IsTruncated)
    ? await listRecords(zoneId, response.NextRecordIdentifier, response.NextRecordName, response.NextRecordType)
    : []

  return records.concat(moreRecords)
}

export function isPrivate (zone: HostedZone): boolean {
  assert(zone.Config !== undefined, `Config is missing for zone id ${String(zone.Id)}.`)

  return zone.Config.PrivateZone ?? false
}

export async function getNsRecord (zoneId: string): Promise<Set<string>> {
  const command = new GetHostedZoneCommand({ Id: zoneId })
  const response = await client.send(command)

  assert(response.DelegationSet !== undefined, `DelegationSet is missing for zone id ${zoneId}.`)

  return new Set<string>(response.DelegationSet?.NameServers ?? [])
}
