import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { isValidZone, localToUtc, utcToLocal } from '../src/utils/time.js'

describe('isValidZone', () => {
  for (const zone of ['Asia/Dubai', 'Asia/Kolkata', 'Europe/London', 'America/Argentina/Buenos_Aires', 'America/Port-au-Prince', 'Etc/GMT+4', 'UTC']) {
    test(`accepts ${zone}`, () => assert.equal(isValidZone(zone), true))
  }
  for (const zone of ['+04:00', 'UTC+4', 'Dubai', 'asia/dubai', 'Asia/Nowhere', 'GST', '', 'Asia/']) {
    test(`rejects "${zone}"`, () => assert.equal(isValidZone(zone), false))
  }
})

describe('localToUtc', () => {
  test('converts wall-clock time to UTC', () => {
    assert.equal(localToUtc('2026-10-12T10:30', 'Asia/Dubai').toISOString(), '2026-10-12T06:30:00.000Z')
  })
  test('handles a date change across the offset', () => {
    assert.equal(localToUtc('2026-10-12T04:30', 'Asia/Kolkata').toISOString(), '2026-10-11T23:00:00.000Z')
  })
  test('returns null for a DST gap, impossible dates and bad input', () => {
    assert.equal(localToUtc('2026-03-08T02:30', 'America/New_York'), null)
    assert.equal(localToUtc('2026-02-30T10:00', 'Asia/Dubai'), null)
    assert.equal(localToUtc('2026-10-12T10:30Z', 'Asia/Dubai'), null)
    assert.equal(localToUtc('2026-10-12T10:30', 'Nope/Zone'), null)
  })
  test('ambiguous time in a DST fall-back hour resolves to the first occurrence', () => {
    // 2026-11-01 01:30 happens twice in New York; earlier one is EDT (UTC-4)
    assert.equal(localToUtc('2026-11-01T01:30', 'America/New_York').toISOString(), '2026-11-01T05:30:00.000Z')
  })
  test('round-trips through utcToLocal', () => {
    const utc = localToUtc('2026-10-12T10:30', 'Asia/Dubai')
    assert.equal(utcToLocal(utc, 'Asia/Dubai'), '2026-10-12T10:30')
  })
})
