# cybai.re — OSINT

A single-page OSINT lookup tool at [`app.cybai.re`](https://app.cybai.re).

Paste a domain, IP, URL, CVE, ASN, or SHA-256 hash — the app auto-detects the type and
fires all relevant lookups in parallel against [`api.cybai.re`](https://api.cybai.re).

## Supported inputs

| Type | Example | Sources |
|------|---------|---------|
| Domain | `example.com` | WHOIS, DNS, certs, reputation, mail security, threat |
| IPv4 / IPv6 | `1.1.1.1` | Geolocation, reverse DNS, reputation, threat |
| URL | `https://example.com/path` | URL threat + domain lookups |
| CVE | `CVE-2021-44228` | MITRE CVE record, CVSS score, references |
| ASN | `AS13335` | BGPView info, IPv4/IPv6 prefix list |
| SHA-256 | `abc123…` | MalwareBazaar sample info |

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind v4** via `@tailwindcss/vite`
- **Cloudflare Pages** (static deploy, no backend)

All data comes from [`api.cybai.re`](https://api.cybai.re/docs) — open CORS, no auth.

## Running locally

```bash
npm install
npm run dev        # localhost:5173
npm run build      # production build → dist/
npm run typecheck  # tsc --noEmit
npm run deploy     # build + wrangler pages deploy dist
```

## License

[MIT](LICENSE)
