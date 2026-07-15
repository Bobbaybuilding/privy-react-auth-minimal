import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';

function App() {
  const { ready, authenticated, login, logout } = usePrivy();

  if (!ready) return null;

  return (
    <button onClick={authenticated ? logout : login}>
      {authenticated ? 'Log out' : 'Log in'}
    </button>
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
