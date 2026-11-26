const noStore = { 'Cache-Control': 'no-store' }
const countedPages = new Set(['/', '/index.html', '/privacy/', '/privacy/index.html'])

export class VisitCounter {
  constructor(state) {
    this.storage = state.storage
  }

  async fetch(request) {
    const views = (await this.storage.get('views')) ?? 0

    if (request.method === 'GET') {
      return Response.json({ views }, { headers: noStore })
    }

    await this.storage.put('views', views + 1)
    return new Response(null, { status: 204, headers: noStore })
  }
}

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url)

    if (url.pathname === '/api/visits') {
      if (request.method !== 'GET') {
        return new Response(null, {
          status: 405,
          headers: { ...noStore, Allow: 'GET' },
        })
      }
      return env.VISITS.getByName('website').fetch('https://counter/visits')
    }

    const response = await env.ASSETS.fetch(request)
    const destination = request.headers.get('Sec-Fetch-Dest')
    const purpose = request.headers.get('Sec-Purpose') ?? request.headers.get('Purpose') ?? ''

    if (
      url.hostname === 'ichor.qilvo.games' &&
      countedPages.has(url.pathname) &&
      request.method === 'GET' &&
      response.status === 200 &&
      response.headers.get('Content-Type')?.startsWith('text/html') &&
      request.headers.get('Accept')?.includes('text/html') &&
      (!destination || destination === 'document') &&
      !/prefetch|prerender/i.test(purpose) &&
      request.headers.get('DNT') !== '1' &&
      request.headers.get('Sec-GPC') !== '1'
    ) {
      // Counting must not delay or break page delivery; visitor metadata stays out of storage.
      context.waitUntil(Promise.resolve().then(() => {
        return env.VISITS.getByName('website').fetch('https://counter/visits', { method: 'POST' })
      }).catch(() => {}))
    }

    return response
  },
}
