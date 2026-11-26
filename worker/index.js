const noStore = { 'Cache-Control': 'no-store' }

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
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname !== '/api/visits') {
      return env.ASSETS.fetch(request)
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
      return new Response(null, {
        status: 405,
        headers: { ...noStore, Allow: 'GET, POST' },
      })
    }

    if (request.method === 'POST') {
      if (request.headers.get('Origin') !== url.origin) {
        return new Response(null, { status: 403, headers: noStore })
      }

      if (request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1') {
        return new Response(null, { status: 204, headers: noStore })
      }
    }

    // Keep visitor headers, cookies, and URLs out of durable storage.
    return env.VISITS.getByName('website').fetch('https://counter/visits', {
      method: request.method,
    })
  },
}
