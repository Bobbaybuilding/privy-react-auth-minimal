"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useFundWallet as useFundWalletEvm,
  useAddFunds,
  useFiatOnramp,
  useFundWalletWithBankDeposit,
  useWallets as useWalletsEvm,
  FundWalletConfig,
} from "@privy-io/react-auth";
import {
  useFundWallet as useFundWalletSolana,
  useWallets as useWalletsSolana,
  type SolanaFundingConfig,
} from "@privy-io/react-auth/solana";
import Section from "../reusables/section";
import { showErrorToast } from "../ui/custom-toast";

type WalletInfo = {
  address: string;
  type: "ethereum" | "solana";
  name: string;
};

const FundWallet = () => {
  const { wallets: walletsEvm } = useWalletsEvm();
  const { wallets: walletsSolana } = useWalletsSolana();
  const { fundWallet: fundWalletEvm } = useFundWalletEvm();
  const { fundWallet: fundWalletSolana } = useFundWalletSolana();
  const { addFunds } = useAddFunds();
  const { fund: buyWithFiat } = useFiatOnramp();
  const { fund: depositFromBank } = useFundWalletWithBankDeposit();

  const allWallets = useMemo((): WalletInfo[] => {
    const evmWallets: WalletInfo[] = walletsEvm.map((wallet) => ({
      address: wallet.address,
      type: "ethereum" as const,
      name: wallet.address,
    }));

    const solanaWallets: WalletInfo[] = walletsSolana.map((wallet) => ({
      address: wallet.address,
      type: "solana" as const,
      name: wallet.address,
    }));

    return [...evmWallets, ...solanaWallets];
  }, [walletsEvm, walletsSolana]);

  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  useEffect(() => {
    if (allWallets.length > 0 && !selectedWallet) {
      setSelectedWallet(allWallets[0]);
    }
  }, [allWallets, selectedWallet]);

  const isEvmWallet = selectedWallet?.type === "ethereum";
  const isSolanaWallet = selectedWallet?.type === "solana";
  const baseUsdc = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
  const destination = selectedWallet
    ? {
        address: selectedWallet.address,
        asset: baseUsdc,
        chain: "eip155:8453" as const,
      }
    : null;

  const runModernFlow = async (flow: () => Promise<unknown>) => {
    if (!isEvmWallet || !destination) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }

    try {
      await flow();
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.toLowerCase().includes("closed")
      ) {
        showErrorToast(error.message);
      }
    }
  };
  const fundWalletEvmHandler = (config?: FundWalletConfig) => {
    if (!isEvmWallet || !selectedWallet) {
      showErrorToast("Please select an Ethereum wallet");
      return;
    }
    try {
      fundWalletEvm({
        address: selectedWallet.address,
        options: {
          amount: "1",
          ...(config || { asset: "native-currency" }),
        },
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to fund wallet. Please try again.");
    }
  };
  const fundWalletSolanaHandler = (config?: SolanaFundingConfig) => {
    if (!isSolanaWallet || !selectedWallet) {
      showErrorToast("Please select a Solana wallet");
      return;
    }
    try {
      fundWalletSolana({
        address: selectedWallet.address,
        options: {
          amount: "1",
          ...(config || { asset: "native-currency" }),
        },
      });
    } catch (error) {
      console.log(error);
      showErrorToast("Failed to fund wallet. Please try again.");
    }
  };

  const availableActions = [
    {
      name: "Add funds with fiat or crypto",
      function: () =>
        runModernFlow(() =>
          addFunds({
            destination: destination!,
            fiat: { environment: "sandbox" },
            crypto: {},
          }),
        ),
      disabled: !isEvmWallet,
    },
    {
      name: "Buy USDC with fiat (sandbox)",
      function: () =>
        runModernFlow(() =>
          buyWithFiat({
            source: {
              assets: ["gbp", "eur", "usd"],
              defaultAsset: "gbp",
            },
            destination: destination!,
            environment: "sandbox",
          }),
        ),
      disabled: !isEvmWallet,
    },
    {
      name: "Deposit from bank (Bridge sandbox)",
      function: () =>
        runModernFlow(() =>
          depositFromBank({
            source: {
              assets: ["gbp", "eur", "usd"],
              defaultAsset: "gbp",
            },
            destination: { ...destination!, asset: "usdc" },
            provider: "bridge-sandbox",
          }),
        ),
      disabled: !isEvmWallet,
    },
    {
      name: "Fund ETH",
      function: fundWalletEvmHandler,
      disabled: !isEvmWallet,
    },
    {
      name: "Fund USDC (EVM)",
      function: () => {
        fundWalletEvmHandler({ asset: "USDC", amount: "1" });
      },
      disabled: !isEvmWallet,
    },
    {
      name: "Fund SOL",
      function: fundWalletSolanaHandler,
      disabled: !isSolanaWallet,
    },
    {
      name: "Fund USDC (Solana)",
      function: () => {
        fundWalletSolanaHandler({ asset: "USDC", amount: "1" });
      },
      disabled: !isSolanaWallet,
    },
    {
      name: "Fund 15 USDC via card",
      function: () => {
        if (isEvmWallet) {
          fundWalletEvmHandler({
            asset: "USDC",
            amount: "15",
            defaultFundingMethod: "card",
          });
        } else if (isSolanaWallet) {
          fundWalletSolanaHandler({
            asset: "USDC",
            amount: "15",
            defaultFundingMethod: "card",
          });
        } else {
          showErrorToast("Please select a wallet");
        }
      },
    },
    {
      name: "Fund 15 USDC via wallet",
      function: () => {
        if (isEvmWallet) {
          fundWalletEvmHandler({
            asset: "USDC",
            amount: "15",
            defaultFundingMethod: "wallet",
          });
        } else if (isSolanaWallet) {
          fundWalletSolanaHandler({
            asset: "USDC",
            amount: "15",
            defaultFundingMethod: "wallet",
          });
        } else {
          showErrorToast("Please select a wallet");
        }
      },
    },
    {
      name: "Fund 15 USDC via exchange",
      function: () => {
        if (isEvmWallet) {
          fundWalletEvmHandler({
            asset: "USDC",
            amount: "15",
            defaultFundingMethod: "exchange",
          });
        } else if (isSolanaWallet) {
          fundWalletSolanaHandler({
            asset: "USDC",
            amount: "15",
            defaultFundingMethod: "exchange",
          });
        } else {
          showErrorToast("Please select a wallet");
        }
      },
    },
  ];
  return (
    <Section
      name="Fund wallet"
      description={
        "Explore Privy's current fiat, bank, exchange, and external-wallet funding flows. Modern fiat and Bridge actions use sandbox environments."
      }
      filepath="src/components/sections/fund-wallet"
      actions={availableActions}
    >
      <div className="mb-4">
        <label
          htmlFor="fund-wallet-select"
          className="block text-sm font-medium mb-2"
        >
          Select wallet:
        </label>
        <div className="relative">
          <select
            id="fund-wallet-select"
            value={selectedWallet?.address || ""}
            onChange={(e) => {
              const wallet = allWallets.find(
                (w) => w.address === e.target.value,
              );
              setSelectedWallet(wallet || null);
            }}
            className="w-full pl-3 pr-8 py-2 border border-[#E2E3F0] rounded-md bg-white text-black focus:outline-none focus:ring-1 focus:ring-black appearance-none"
          >
            {allWallets.length === 0 ? (
              <option value="">No wallets available</option>
            ) : (
              <>
                <option value="">Select a wallet</option>
                {allWallets.map((wallet) => (
                  <option key={wallet.address} value={wallet.address}>
                    {wallet.address} [
                    {wallet.type === "ethereum" ? "ethereum" : "solana"}]
                  </option>
                ))}
              </>
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default FundWallet;
