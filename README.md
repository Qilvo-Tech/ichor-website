# Ichor Online pre-release roadmap

Public roadmap and landing page for [Ichor Online](https://ichor.qilvo.games).

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
```

Pull requests run the production build and dependency audit. Merges to `main`
deploy to Cloudflare Workers through `wrangler.jsonc`.

The GitHub `production` environment requires these secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

The token should use the **Edit Cloudflare Workers** template and be limited to
the Cloudflare account and `qilvo.games` zone used by this website.

## Visit counter

The production page sends one empty `POST /api/visits` per page load. A
Cloudflare Durable Object stores only the aggregate `views` number; it survives
Worker restarts and deployments. Its SQLite namespace is created automatically
on the first deployment through `wrangler.jsonc`.

Read the total at <https://ichor.qilvo.games/api/visits>, which returns
`{"views":123}`. Reading the total does not increment it. The total is public.

The counter uses no cookies, browser storage, visitor IDs, fingerprinting,
third-party scripts, or event logs. The request omits credentials and referrer
information. Do Not Track and Global Privacy Control opt-outs are respected.
Development and preview hosts do not count automatically. Cloudflare still
handles the normal network request as the existing website host.

These are approximate page views, not unique visitors: refreshes count again,
JavaScript-disabled or blocked requests do not count, and automated requests can
inflate the total. Same-origin checks reject browser requests from other sites;
they do not authenticate requests from scripts. There is no reset endpoint.
