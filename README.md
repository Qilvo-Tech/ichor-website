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
