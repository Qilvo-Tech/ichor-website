# Visit counter: privacy review and service choice

Reviewed on 26 November 2026. Scope: the website source, its proposed counter,
LibreCounter's published documentation, and Cloudflare's public terms. This is
a technical assessment, not a finding that the whole website complies with
every applicable data protection or ePrivacy requirement.

## Decision

Keep the small counter on the existing Cloudflare host. The current requirement
is an approximate page-view total. LibreCounter's geographic, browser, device,
page, and daily breakdowns are not needed for that requirement.

| Option | Data and operation | Fit for Ichor |
| --- | --- | --- |
| Existing minimal counter | One empty same-origin request and one durable aggregate integer. No additional analytics service. | Recommended for the current requirement. |
| Hosted LibreCounter | The default image integration sends the full page URL to another service, which derives additional statistics. Statistics are public; the operator offers no service guarantee. | Useful if those additional reports become a requirement. |
| Self-hosted LibreCounter | Adds its Node application, database, and hosting maintenance to obtain those reports. | More components than the current count needs. |

LibreCounter's statement that adding an image removes the site's GDPR
obligations should not be treated as a legal determination. Its own README also
discusses uncertainty around ePrivacy requirements.

## What the current counter does

- Runs once per production document load, outside React effects.
- Sends an empty POST to the same origin, omitting credentials and referrer.
- Stores only `views`, an aggregate integer in SQLite-backed Durable Object
  storage. It forwards no visitor headers, URL parameters, or request body to
  that storage object.
- Does not use cookies, browser storage, visitor identifiers, IP-derived hashes,
  geographic lookups, browser classification, or per-visit timestamps.
- Honors Do Not Track and Global Privacy Control in both client and endpoint.
- Disables Worker observability in the deployment configuration and adds no
  application request logging, Logpush destinations, or third-party scripts.
- Exposes the total publicly through a read-only GET endpoint. Reads do not
  increment the total; there is no public reset operation.

The security policy permits same-origin connections so the browser can reach
the endpoint. It continues to disallow connections to outside services.

Refreshes count again. Blocked or JavaScript-disabled requests are absent and
scripted requests can inflate the count. This is not a unique-person metric.
The anonymous total is retained for the lifetime of the counter.

## Hosting and legal boundaries

The counter's stored total contains no visitor-level data. The incoming network
request still reaches Cloudflare, which processes network metadata including
IP addresses to provide its services. Disabling Worker observability does not
disable all Cloudflare infrastructure or security processing.

Cloudflare's standard Self-Serve Subscription Agreement, section 6.1,
incorporates its Data Processing Addendum by reference. The DPA addresses
international transfers. These published terms do not establish which agreement
or account-specific logging arrangements apply to the website's account.

LibreCounter has a similar distinction between analytics and infrastructure:
its tracking documentation discloses nginx logs containing IP addresses, kept
for ten days for diagnostics. Its hosting provider also sees network traffic.
Switching to that service therefore does not remove hosting-level processing.

Cookieless operation alone does not establish a consent exemption. EDPB
Guidelines 2/2023 cover other forms of device access and requests; exemptions
require a separate assessment under applicable national rules. No blanket
GDPR-compliance or consent-free claim is made for this implementation.

The checked source currently has no visitor-facing privacy notice. The site
operator's notice should describe the aggregate count and Cloudflare hosting,
and provide the applicable controller/contact, purposes, legal basis, and
rights information. This review does not verify the account's infrastructure
logs, log exports, accepted agreement, or the controller's legal records.

## Sources

- [LibreCounter README: integration, stored data, and guarantees](https://github.com/alexfernandez/librecounter)
- [LibreCounter options and full-URL referrer behavior](https://librecounter.org/options)
- [LibreCounter infrastructure logging](https://github.com/alexfernandez/librecounter/blob/main/doc/tracking.md)
- [Cloudflare Self-Serve Subscription Agreement, section 6.1](https://www.cloudflare.com/terms/)
- [Cloudflare Data Processing Addendum](https://www.cloudflare.com/cloudflare-customer-dpa/)
- [Cloudflare privacy policy: end-user and network data](https://www.cloudflare.com/privacypolicy/)
- [Cloudflare Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [EDPB Guidelines 2/2023, final version](https://www.edpb.europa.eu/documents/guideline/guidelines-22023-on-technical-scope-of-art-53-of-eprivacy-directive_en)
