import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import worker, { VisitCounter } from './index.js'

function setup(assetResponse = () => new Response('website', { headers: { 'Content-Type': 'text/html' } })) {
  const stored = new Map()
  const forwarded = []
  const pending = []
  const counter = new VisitCounter({
    storage: {
      get: async key => stored.get(key),
      put: async (key, value) => { stored.set(key, value) },
    },
  })
  const env = {
    ASSETS: { fetch: async request => assetResponse(request) },
    VISITS: {
      getByName(name) {
        assert.equal(name, 'website')
        return {
          fetch(url, options) {
            const request = new Request(url, options)
            forwarded.push(request)
            return counter.fetch(request)
          },
        }
      },
    },
  }
  async function request(path = '/', { method = 'GET', headers = {}, origin = 'https://ichor.qilvo.games' } = {}) {
    const response = await worker.fetch(new Request(origin + path, {
      method, headers: { Accept: 'text/html', 'Sec-Fetch-Dest': 'document', ...headers },
    }), env, { waitUntil: promise => pending.push(promise) })
    await Promise.all(pending.splice(0))
    return response
  }
  return { stored, forwarded, env, request }
}

test('the browser does not need any analytics connection', async () => {
  const headers = await readFile(new URL('../public/_headers', import.meta.url), 'utf8')
  const policy = headers.split('\n').find(line => line.trim().startsWith('Content-Security-Policy:'))
  assert.ok(policy)
  assert.equal(policy.split(';').find(value => value.trim().startsWith('connect-src '))?.trim(), "connect-src 'none'")
})

test('delivered home and privacy documents increment a single aggregate; reads do not', async () => {
  const { request, stored } = setup()
  assert.deepEqual(await (await request('/api/visits')).json(), { views: 0 })
  for (const path of ['/', '/privacy/']) {
    const response = await request(path)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Set-Cookie'), null)
    assert.equal(await response.text(), 'website')
  }
  const response = await request('/api/visits')
  assert.deepEqual(await response.json(), { views: 2 })
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.deepEqual(await (await request('/api/visits')).json(), { views: 2 })
  assert.deepEqual([...stored], [['views', 2]])
})

test('the public API cannot increment or reset the count', async () => {
  const { request, forwarded } = setup()
  for (const method of ['POST', 'DELETE', 'HEAD', 'OPTIONS']) {
    const response = await request('/api/visits', { method })
    assert.equal(response.status, 405)
    assert.equal(response.headers.get('Allow'), 'GET')
  }
  assert.equal(forwarded.length, 0)
})

test('honors received Do Not Track and Global Privacy Control signals', async () => {
  const { request, stored, forwarded } = setup()
  for (const headers of [{ DNT: '1' }, { 'Sec-GPC': '1' }]) {
    assert.equal((await request('/', { headers })).status, 200)
  }
  assert.equal(stored.size, 0)
  assert.equal(forwarded.length, 0)
})

test('does not forward visitor headers, URL parameters, or bodies to storage', async () => {
  const { request, forwarded } = setup()
  await request('/?private=value', { headers: {
    Cookie: 'private=value',
    Referer: 'https://other.example/?private=value',
    'CF-Connecting-IP': '192.0.2.1',
    'User-Agent': 'private-agent',
  } })
  assert.equal(forwarded.length, 1)
  assert.equal(forwarded[0].url, 'https://counter/visits')
  assert.deepEqual([...forwarded[0].headers], [])
  assert.equal(await forwarded[0].text(), '')
})

test('assets, non-document requests, prefetches, and previews do not count', async () => {
  const { request, stored } = setup()
  await request('/assets/logo.png')
  await request('/', { method: 'HEAD' })
  await request('/', { method: 'POST' })
  await request('/', { headers: { Accept: 'application/json' } })
  await request('/', { headers: { 'Sec-Fetch-Dest': 'empty' } })
  await request('/', { headers: { 'Sec-Purpose': 'prefetch' } })
  await request('/', { headers: { Purpose: 'prefetch;prerender' } })
  await request('/', { origin: 'https://preview.workers.dev' })
  await request('/', { origin: 'http://localhost:8791' })
  assert.equal(stored.size, 0)
})

test('redirects and failed page responses do not count', async () => {
  for (const status of [301, 404, 500]) {
    const { request, stored } = setup(() => new Response('website', {
      status, headers: { 'Content-Type': 'text/html' },
    }))
    assert.equal((await request()).status, status)
    assert.equal(stored.size, 0)
  }
})

test('counter failures cannot break page delivery', async () => {
  for (const fail of [
    () => { throw new Error('binding unavailable') },
    () => ({ fetch: () => Promise.reject(new Error('storage unavailable')) }),
  ]) {
    const { env, request } = setup()
    env.VISITS.getByName = fail
    const response = await request()
    assert.equal(response.status, 200)
    assert.equal(await response.text(), 'website')
  }
})
