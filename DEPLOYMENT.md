# Gabana Admin Frontend Deployment

## Vercel

Project:

- `gabanaadminfront`

Production URL:

- `https://gabanaadminfront.vercel.app`

Required variables:

```env
VITE_API_BASE_URL=https://gabanabackadonis-production.up.railway.app/api
```

Optional variables:

```env
VITE_GOOGLE_MAPS_API_KEY=<google-maps-browser-key>
```

## Commands

Install:

```bash
npm ci
```

Build:

```bash
npm run build
```

Deploy production:

```bash
vercel --prod --yes
```

Check deployment:

```bash
curl -I https://gabanaadminfront.vercel.app
```

## Sprint 0 Verification

- Vercel project is linked locally
- Production deploy completed
- Production alias points to `https://gabanaadminfront.vercel.app`
- Backend API base URL points to Railway production
