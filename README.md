# Minimal Privy wallet funding playground

A minimal React app using Privy's standard authentication and wallet-funding modals. It creates an embedded Ethereum wallet for users who do not already have one and exposes Privy's combined fiat/crypto funding, fiat onramp, Bridge sandbox bank deposit, legacy funding, and account interfaces.

## Run locally

```sh
npm install
cp .env.example .env.local
npm run dev
```

Set `VITE_PRIVY_APP_ID` in `.env.local` before starting the app.
