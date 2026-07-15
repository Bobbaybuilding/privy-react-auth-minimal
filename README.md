# Minimal Privy React Auth

A blank React app that opens Privy's standard authentication flow and creates an embedded Ethereum wallet for users who do not already have one.

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_PRIVY_APP_ID` in `.env.local` before starting the app.
