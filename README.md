# Privy funding playground

This project is based on Privy's official funding starter and showcases Privy's native wallet funding flows inside a Next.js application. It uses the current React SDK and adds Privy's combined fiat/crypto flow, fiat sandbox, and Bridge sandbox bank deposits to the official card, exchange, and external-wallet examples.

## 📖 Related Recipe

For a step-by-step guide on funding wallets with Apple Pay and Google Pay, check out our [Card-based Funding Recipe](https://docs.privy.io/recipes/card-based-funding) in the Privy documentation.

## Live Demo

[View this deployment](https://privy-react-auth-minimal.vercel.app/)

Privy's official funding starter is available at [privy-next-funding.vercel.app](https://privy-next-funding.vercel.app/).

## Quick Start

### 0. Dashboard setup

- Create an app in the Privy dashboard [here](https://dashboard.privy.io/)
- Configure funding settings if needed [here](https://docs.privy.io/recipes/card-based-funding#funding-wallets-with-apple-pay-and-google-pay)

### 1. Clone the Project

```bash
mkdir -p privy-next-funding && curl -L https://github.com/privy-io/privy-examples/archive/main.tar.gz | tar -xz --strip=3 -C privy-next-funding examples-main/examples/privy-next-funding && cd privy-next-funding
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the example environment file and configure your Privy app credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Privy app credentials:

```env
# Public - Safe to expose in the browser
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here

# Private - Keep server-side only
PRIVY_APP_SECRET=your_app_secret_here

# Optional: Uncomment if using custom auth URLs or client IDs
# NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id_here
# NEXT_PUBLIC_PRIVY_AUTH_URL=https://auth.privy.io
```

**Important:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Keep `PRIVY_APP_SECRET` private and server-side only.

### 4. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Core Functionality

### 1. Login with Privy

Login or sign up using Privy's pre-built modals.

[`app/page.tsx`](./app/page.tsx)

```tsx
import { usePrivy } from "@privy-io/react-auth";
const { login } = usePrivy();
login();
```

### 2. Create Embedded Wallets

Create embedded wallets for your users. Wallets can also be automatically created on login by configuring your PrivyProvider.

[`lib/privy/LoginButton.tsx`](./lib/privy/LoginButton.tsx)

```tsx
import { useCreateWallet } from "@privy-io/react-auth";
const { createWallet } = useCreateWallet();
createWallet({ createAdditional: true });
```

### 3. Fund Your Wallet

Fund your wallet using a card, exchange, or external wallet. Privy has bridging integration out of the box powered by Relay.

[`lib/privy/FundingButton.tsx`](./lib/privy/FundingButton.tsx)

```tsx
import { useFundWallet, useWallets } from "@privy-io/react-auth";
const { wallets } = useWallets();
const { fundWallet } = useFundWallet();
fundWallet(wallets[0].address, { asset: "USDC", amount: "15" });
```

### 4. Deposit from a Bank Account

The upstream `privy-next-funding` example does not include the bank deposit or virtual account flow. This repo adds Privy's documented `useFundWalletWithBankDeposit` hook.

The `Bank deposit: KYC + virtual account` action opens Privy's Bridge sandbox flow. After the user completes KYC, Privy's modal returns virtual account deposit instructions for bank transfer funding.

```tsx
import { useFundWalletWithBankDeposit } from "@privy-io/react-auth";

const { fund } = useFundWalletWithBankDeposit();

await fund({
  source: {
    assets: ["gbp", "eur", "usd", "mxn", "brl"],
    defaultAsset: "gbp",
  },
  destination: {
    asset: "usdc",
    chain: "eip155:8453",
    address: wallet.address,
  },
  provider: "bridge-sandbox",
});
```

For production, configure Bridge in the Privy Dashboard and switch the provider to `"bridge"`.

## Relevant Links

- [Privy Dashboard](https://dashboard.privy.io)
- [Privy Documentation](https://docs.privy.io)
- [React SDK](https://www.npmjs.com/package/@privy-io/react-auth)
- [Funding Guide](https://docs.privy.io/guide/react/recipes/misc/funding)
- [Bank Deposits](https://docs.privy.io/wallets/funding/bank-deposits)
