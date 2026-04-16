# cybai.re

A Swiss-knife cyber tool at [`app.cybai.re`](https://app.cybai.re).

Four tabs, all client-side, all backed by [`api.cybai.re`](https://api.cybai.re) (open CORS, no auth, no keys).

## Tabs

### Lookup
Paste any of the following — the app auto-detects the type and fires all relevant lookups in parallel:

| Input | Example | Sources |
|-------|---------|---------|
| Domain | `example.com` | WHOIS, DNS, certificates, mail security (SPF/DMARC/DKIM) |
| IPv4 / IPv6 | `1.1.1.1` | Geolocation, reverse DNS, Shodan InternetDB, WHOIS, reputation |
| URL | `https://example.com/path` | Extracts hostname → domain lookups |
| CVE | `CVE-2021-44228` | MITRE record, CVSS score, references |
| ASN | `AS13335` | BGPView info, IPv4/IPv6 prefix list |
| SHA-256 | `abc123…` | MalwareBazaar sample info |

### Mail
Analyze a raw email (`.eml` upload or paste). Extracts routing hops, participants, links, attachments, and full headers. Clickable IPs and domains open in the Lookup tab.

### User-Agent
Paste any user-agent string (or use your own) to parse browser, OS, device, and engine details.

### My IP
Detects your public IP and runs all IP lookups automatically.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind v4** via `@tailwindcss/vite`
- **Cloudflare Worker** (`[assets]` binding, not Pages)
- **postal-mime** for offline email parsing

## Running locally

```bash
bun install
bun run dev        # localhost:5173
bun run build      # → dist/
bun run typecheck  # tsc --noEmit
bun run deploy     # build + wrangler deploy
```

## License

[MIT](LICENSE)
