import assert from 'node:assert/strict'
import test from 'node:test'
import worker, { VisitCounter } from './index.js'

function setup() {
  const stored = new Map()
  const forwarded = []
  const counter = new VisitCounter({
    storage: {
      get: async key => stored.get(key),
      put: async (key, value) => { stored.set(key, value) },
    },
  })
  const env = {
    ASSETS: { fetch: async () => new Response('website') },
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
  const request = (method = 'GET', headers = {}) => worker.fetch(new Request(
    'https://ichor.qilvo.games/api/visits',
    { method, headers },
  ), env)
  return { stored, forwarded, env, request }
}

test('only POST increments; reads return a non-cached public total', async () => {
  const { request, stored } = setup()
  assert.deepEqual(await (await request()).json(), { views: 0 })
  for (let i = 0; i < 3; i++) {
    const response = await request('POST', { Origin: 'https://ichor.qilvo.games' })
    assert.equal(response.status, 204)
    assert.equal(response.headers.get('Set-Cookie'), null)
  }
  const response = await request()
  assert.deepEqual(await response.json(), { views: 3 })
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  assert.deepEqual(await (await request()).json(), { views: 3 })
  assert.deepEqual([...stored], [['views', 3]])
})

test('rejects foreign or missing origins and unsupported methods without counting', async () => {
  const { request, forwarded } = setup()
  assert.equal((await request('POST')).status, 403)
  assert.equal((await request('POST', { Origin: 'https://other.example' })).status, 403)
  const response = await request('DELETE')
  assert.equal(response.status, 405)
  assert.equal(response.headers.get('Allow'), 'GET, POST')
  assert.equal(forwarded.length, 0)
})

test('honors Do Not Track and Global Privacy Control without counting', async () => {
  const { request, stored, forwarded } = setup()
  for (const optOut of [{ DNT: '1' }, { 'Sec-GPC': '1' }]) {
    assert.equal((await request('POST', {
      Origin: 'https://ichor.qilvo.games', ...optOut,
    })).status, 204)
  }
  assert.equal(stored.size, 0)
  assert.equal(forwarded.length, 0)
})

test('does not forward visitor headers or request metadata to the counter', async () => {
  const { request, forwarded } = setup()
  await request('POST', {
    Origin: 'https://ichor.qilvo.games',
    Cookie: 'private=value',
    Referer: 'https://ichor.qilvo.games/?private=value',
    'CF-Connecting-IP': '192.0.2.1',
    'User-Agent': 'private-agent',
  })
  assert.equal(forwarded[0].url, 'https://counter/visits')
  assert.deepEqual([...forwarded[0].headers], [])
  assert.equal(await forwarded[0].text(), '')
})

test('serves the existing website independently of the counter', async () => {
  const { env, forwarded } = setup()
  const response = await worker.fetch(new Request('https://ichor.qilvo.games/'), env)
  assert.equal(await response.text(), 'website')
  assert.equal(forwarded.length, 0)
})
