# app.cybai.re

A Swiss-knife cyber tool at [`app.cybai.re`](https://app.cybai.re).

All client-side, all backed by [`api.cybai.re`](https://api.cybai.re) (open CORS, no auth, no keys).

## Lookup

Paste anything — the app auto-detects the type and fires all relevant lookups in parallel:

| Input | Example | Sources |
|-------|---------|---------|
| Domain | `example.com` | WHOIS, DNS, certificates, mail security (SPF/DMARC/DKIM), DNS propagation |
| IPv4 / IPv6 | `1.1.1.1` | Geolocation, reverse DNS, Shodan InternetDB, WHOIS, reputation (StopForumSpam) |
| URL | `https://example.com/path` | Redirect chain + domain lookups |
| CVE | `CVE-2021-44228` | MITRE record, CVSS score, references |
| ASN | `AS13335` | BGPView info, IPv4/IPv6 prefix list |
| SHA-256 / SHA-1 / MD5 | `abc123…` | MalwareBazaar sample info |
| JWT | `eyJhbGci…` | Offline decoder — header, claims, expiry countdown |
| CIDR | `192.168.0.0/24` | Offline subnet calculator — network, broadcast, host range |

Risk indicators (Clean / Suspicious / Malicious) are shown at the top of IP and domain results based on aggregated signals.

## Other tabs

- **Mail** — analyze a raw email (`.eml` upload or paste). Routing hops, participants, links, attachments, full headers. Clickable IPs and domains open in the Lookup tab. Fully offline via postal-mime.
- **User-Agent** — parse any UA string (or your own) into browser, OS, device, and engine.
- **My IP** — detects your public IP via `api.cybai.re/cyber/ip/me` and runs all IP lookups.

## UX

- **Search history** — recent lookups persisted in localStorage, shown as dismissible chips on the landing page.
- **Copy buttons** — hover any data row to copy its value.
- **Cmd+K / `/`** — focus the search bar from anywhere on the Lookup tab.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind v4** via `@tailwindcss/vite`
- **Cloudflare Pages** — SPA routing via `public/_redirects`
- **postal-mime** for offline email parsing

## Running locally

```bash
bun install
bun run dev        # localhost:5173
bun run build      # → dist/
bun run typecheck  # tsc --noEmit
bun run deploy     # build + wrangler pages deploy dist
```

## License

[MIT](LICENSE)
