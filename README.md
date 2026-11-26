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

The production Worker counts successful HTML deliveries of the home and privacy
pages as part of the normal page request. There is no browser analytics script
or separate tracking request. A Cloudflare Durable Object stores only the
aggregate `views` number; it survives Worker restarts and deployments. Its
SQLite namespace is created automatically on the first deployment through
`wrangler.jsonc`.

Read the total at <https://ichor.qilvo.games/api/visits>, which returns
`{"views":123}`. Reading the total does not increment it. The total is public.

The counter uses no cookies, browser storage, visitor IDs, fingerprinting,
third-party scripts, or event logs. Visitor metadata is not forwarded to counter
storage. Received Do Not Track and Global Privacy Control opt-out headers are
respected. Development and preview hosts do not count automatically. Cloudflare
still handles the normal network request as the existing website host.

These are approximate page views, not unique visitors: refreshes count again,
pages restored entirely from browser cache may not count, and automated page
requests can inflate the total. Asset requests, prefetches, and unsuccessful page
deliveries are excluded. The public endpoint only accepts GET; there is no
public increment or reset endpoint. A failed count does not block page delivery.

The footer links to a static [privacy notice](public/privacy/index.html) that
works without JavaScript. The browser security policy keeps `connect-src 'none'`.

See the [privacy review and service comparison](docs/visit-counter-privacy.md)
for the choice of this minimal counter over LibreCounter, the hosting-data
boundary, and the limits of the compliance assessment.
