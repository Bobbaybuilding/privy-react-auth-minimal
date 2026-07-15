import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  PrivyProvider,
  useAddFunds,
  useFiatOnramp,
  useFundWallet,
  useFundWalletWithBankDeposit,
  usePrivy,
  useWallets,
} from '@privy-io/react-auth';
import { UserPill } from '@privy-io/react-auth/ui';

const base = 'eip155:8453';
const baseUsdc = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';

function App() {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { addFunds } = useAddFunds();
  const { fund: buyWithFiat } = useFiatOnramp();
  const { fund: depositFromBank } = useFundWalletWithBankDeposit();
  const { fundWallet } = useFundWallet();
  const [message, setMessage] = useState('');
  const wallet = wallets.find(({ walletClientType }) => walletClientType === 'privy');

  if (!ready) return null;

  if (!authenticated) {
    return <button onClick={login}>Log in</button>;
  }

  if (!wallet) {
    return <p>Creating your embedded wallet…</p>;
  }

  const run = async (action) => {
    setMessage('');
    try {
      await action();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The flow was closed.');
    }
  };

  const destination = {
    address: wallet.address,
    asset: baseUsdc,
    chain: base,
  };

  return (
    <main>
      <UserPill expanded />
      <h1>Fund your Privy wallet</h1>
      <p>{wallet.address}</p>

      <p>
        <button
          onClick={() =>
            run(() =>
              addFunds({
                destination,
                fiat: { environment: 'sandbox' },
                crypto: {},
              }),
            )
          }
        >
          Add funds with fiat or crypto
        </button>
      </p>

      <p>
        <button
          onClick={() =>
            run(() =>
              buyWithFiat({
                source: { assets: ['gbp', 'eur', 'usd'], defaultAsset: 'gbp' },
                destination,
                environment: 'sandbox',
              }),
            )
          }
        >
          Buy USDC with fiat
        </button>
      </p>

      <p>
        <button
          onClick={() =>
            run(() =>
              depositFromBank({
                source: { assets: ['gbp', 'eur', 'usd'], defaultAsset: 'gbp' },
                destination: {...destination, asset: 'usdc'},
                provider: 'bridge-sandbox',
              }),
            )
          }
        >
          Deposit from a bank account
        </button>
      </p>

      <p>
        <button
          onClick={() =>
            run(() =>
              fundWallet({
                address: wallet.address,
                options: { chain: { id: 8453 }, asset: 'USDC' },
              }),
            )
          }
        >
          Open legacy funding flow
        </button>
      </p>

      {message && <p role="alert">{message}</p>}
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        embeddedWallets: {
          ethereum: { createOnLogin: 'users-without-wallets' },
        },
      }}
    >
      <App />
    </PrivyProvider>
  </StrictMode>,
);
