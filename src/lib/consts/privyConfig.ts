import type { PrivyClientConfig } from "@privy-io/react-auth"
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana"

// TODO: Overriding a chain's RPC provider when need to scale
// https://docs.privy.io/guide/react/configuration/networks/evm#rpc-override

export const solanaClusters = {
  devnet: "https://api.devnet.solana.com",
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
}

const solanaConnectors = toSolanaWalletConnectors({
  // By default, shouldAutoConnect is enabled
  shouldAutoConnect: true,
})
const clusters = ["mainnet-beta", "devnet"] as const
// Replace this with your Privy config
export const privyConfig: PrivyClientConfig = {
  // Customize Privy's appearance in your app
  appearance: {
    theme: "light",
    accentColor: "#676FFF",
    showWalletLoginFirst: true,
    //   logo: "https://your-logo-url",
  },
  solanaClusters: clusters.map((item) => ({
    name: item,
    rpcUrl: solanaClusters[item],
  })),
  // Create embedded wallets for users who don't have a wallet
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    // requireUserPasswordOnCreate: true,
    // noPromptOnSignature: false,
  },
  externalWallets: {
    solana: {
      connectors: solanaConnectors,
    },
  },
}
