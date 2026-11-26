# Visit counter: privacy review and service choice

Reviewed on 26 November 2026. Scope: the website source, local Cloudflare runtime,
the accessible production Worker settings, and the providers' published terms.
Account settings were checked separately from the providers' public terms.
This technical review does not certify the entire website or hosting account
as GDPR compliant.

## Decision and data flow

Keep the counter on the existing Cloudflare host. The requirement is an
approximate page-view total. LibreCounter's geographic, browser, device, page,
and daily breakdowns are unnecessary for that requirement.

| Option | Data and operation | Fit for Ichor |
| --- | --- | --- |
| Minimal counter | Counts normal server page deliveries; stores one aggregate integer. No additional analytics provider or browser tracking request. | Current choice. |
| Hosted LibreCounter | Its default image integration sends the full page URL to another service, which derives additional statistics. Statistics are public; no service guarantee is offered. | Additional reports are not needed. |
| Self-hosted LibreCounter | Adds its Node application, database, and hosting maintenance. | More components than the count needs. |

The Worker serves the requested asset first. A successful HTML document delivery
at the production home or privacy URL schedules a background increment. It
passes only a fixed internal URL and POST method to the Durable Object: no
visitor headers, IP address, query parameters, or body. The object stores only
`views` in durable SQLite-backed storage. The existing storage key, namespace,
and migration remain unchanged.

There is no analytics JavaScript, tracking image, cookie, browser storage,
visitor identifier, fingerprint, IP-derived hash, geographic lookup, browser
classification, or individual visit timestamp. CSP retains `connect-src 'none'`.
Received DNT and Sec-GPC opt-out headers exclude the request. Preview hosts,
assets, known prefetches, and unsuccessful page responses are excluded. A failed
increment does not delay or break the page response.

GET `/api/visits` returns the public aggregate without incrementing it. Other
methods return 405. There is no public reset or increment operation. Refreshes
and automated document requests can count; browser-cache restores may not. This
is not a unique-person metric. The anonymous total is retained for the lifetime
of the counter.

## Notice and assessment

The footer links to `/privacy/`, a static page that needs no JavaScript. It names
Qilvo Tech OÜ (Qilvo Games) and the privacy contact leo@qilvo.games. The compact
company block also includes its registered office (Tallinn), registry code,
register, and VAT number, checked against Estonia's official e-Business
Register. No street address is included.
Commercial Code section 15(2) requires the company name, registered office, and
registry code. Information Society Services Act section 4 separately requires
an address for information-society service providers; its application to this
pre-release informational site is not resolved by this review. No claim is made
that a city and email satisfy every business-disclosure obligation. The notice
explains purposes, data handling, retention,
Cloudflare hosting and transfers, legitimate interests, applicable rights, and
the right to complain to a supervisory authority.

The purpose is to operate a secure, reliable public website and understand its
overall use. The initial network processing relies on legitimate interests,
Article 6(1)(f). The retained aggregate does not identify visitors. The balancing
assessment is:

- Necessity: a total of successful deliveries answers the usage question;
  identifying people, inspecting their devices, or retaining request records
  would add no necessary information.
- Expectations and effect: hosting necessarily processes a visitor's page
  request. Counting produces only a total and has no individual decisions,
  advertising, profiles, or cross-site use.
- Safeguards: no additional browser request, visitor-level storage, analytics
  provider, or application logging; received privacy opt-outs are honored.
  The notice provides a direct contact for objections and other requests.

Cookieless operation alone is not a consent exemption. EDPB Guidelines 2/2023
also cover other ways of accessing terminal information. Counting only normal
page deliveries avoids the additional tracking request and device-reading
behavior of the original browser beacon. On that implementation, no analytics
consent popup is added. This conclusion does not authorize other tracking or
establish exemptions for unrelated hosting/security features.

## Hosting verification

Cloudflare necessarily processes network information, including IP addresses,
requested URLs, and headers, to deliver and protect the website. The counter
does not retain these. Disabling Worker observability does not disable all
Cloudflare infrastructure or security processing.

The refreshed Wrangler OAuth credentials allowed a read-only production check
on 26 November 2026. The existing `ichor-pre-release-roadmap` Worker reported
`logpush: false`, no tail consumers, and no observability configuration. The
proposed configuration explicitly sets `observability.enabled: false`. The
deployed Worker was still the old static site at the time of this check.

Wrangler OAuth could not read the remaining account and zone settings. The
operator supplied a temporary scoped token through a masked local prompt; it
was not saved to disk or sent through chat. The audit made GET requests only.
At 14:44 UTC on 26 November 2026 it verified:

- Both account and zone Logpush job lists were empty.
- Bot Fight Mode and Bot Management JavaScript detection were disabled.
- No zone firewall entrypoint rulesets were returned for the custom, managed,
  or Super Bot Fight Mode phases.
- Security level was medium, Browser Integrity Check was on, and challenge
  passage duration was 1,800 seconds.

These existing security protections were not changed. Cloudflare can still
process security data or issue necessary security cookies when challenging a
request; this is separate from the cookie-free aggregate counter. No claim is
made that the hosting provider can never set a cookie. Logpush's API requires
Logs Write even to list jobs, despite the audit using no write operations.

Cloudflare's Self-Serve Subscription Agreement, section 6.1, incorporates its
Data Processing Addendum. The DPA describes international transfer safeguards;
its privacy policy gives retention criteria for service and security data.
Public documents do not prove the account's accepted contract or individual
security-log retention. The notice therefore
does not promise that Cloudflare stores no data or keeps all processing in the
EEA.

LibreCounter has the same distinction between statistics and infrastructure:
its tracking documentation discloses IP-containing nginx logs retained for ten
days for diagnostics. Switching providers would not remove that distinction.

## Verification evidence

- Unit checks cover counting, privacy opt-outs, metadata isolation, excluded
  responses, the read-only public endpoint, and failure isolation.
- The real local Wrangler runtime served the static notice without JavaScript,
  emitted no Set-Cookie header, and retained the restrictive CSP.
- Production-host document requests incremented the total, while DNT/GPC
  requests did not. Sixty-four concurrent document deliveries each counted once.
- The stored total survived stopping and restarting the local Worker.
- The production JavaScript bundle contains no visit-counter endpoint or beacon.
- Headless Chrome rendered the privacy page and footer at desktop and mobile
  sizes, with no horizontal overflow at a 390-pixel mobile viewport.

## Sources

- [Official company register](https://ariregister.rik.ee/eng/company/17282132)
- [Commercial Code, section 15](https://www.riigiteataja.ee/en/akt/527022024004)
- [Information Society Services Act, section 4](https://www.riigiteataja.ee/en/akt/527072026007)
- [GDPR Article 13](https://eur-lex.europa.eu/eli/reg/2016/679/)
- [EDPB transparency guidance](https://www.edpb.europa.eu/system/files/2023-09/wp260rev01_en.pdf)
- [EDPB Guidelines 2/2023, final version](https://www.edpb.europa.eu/documents/guideline/guidelines-22023-on-technical-scope-of-art-53-of-eprivacy-directive_en)
- [LibreCounter README](https://github.com/alexfernandez/librecounter)
- [LibreCounter options](https://librecounter.org/options)
- [LibreCounter infrastructure logging](https://github.com/alexfernandez/librecounter/blob/main/doc/tracking.md)
- [Cloudflare Self-Serve Subscription Agreement, section 6.1](https://www.cloudflare.com/terms/)
- [Cloudflare Data Processing Addendum](https://www.cloudflare.com/cloudflare-customer-dpa/)
- [Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/)
- [Cloudflare Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Cloudflare Logpush permissions](https://developers.cloudflare.com/logs/logpush/logpush-job/api-configuration/)
