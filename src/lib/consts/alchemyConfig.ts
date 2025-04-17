import { createConfig, cookieStorage } from "@account-kit/react";
import { QueryClient } from "@tanstack/react-query";
import { mainnet,  alchemy } from "@account-kit/infra";

export const config = createConfig(
  {
    // alchemy config
    transport: alchemy({ apiKey: "BDIYY-nYoFiXeD3sVZdiSYgDsOx83tGC" }), // TODO: add your Alchemy API key - setup your app and embedded account config in the alchemy dashboard (https://dashboard.alchemy.com/accounts)
    chain: mainnet, // TODO: specify your preferred chain here and update imports from @account-kit/infra
    ssr: true, // Defers hydration of the account state to the client after the initial mount solving any inconsistencies between server and client state (read more here: https://accountkit.alchemy.com/react/ssr)
    storage: cookieStorage, // persist the account state using cookies (read more here: https://accountkit.alchemy.com/react/ssr#persisting-the-account-state)
    
    // enablePopupOauth: true, // must be set to "true" if you plan on using popup rather than redirect in the social login flow
    // // optional config to override default session manager config
    sessionConfig: {
      expirationTimeMs: 60 * 1000 * 60 * 60, // 60 minutes (default is 15 min)
    },
  },
  {
    illustrationStyle: "outline",
    // authentication ui config - your customizations here
    auth: {
      hideSignInText: true,
      header: "Connect Wallet",
      sections: [
        [{ type: "email" }],
        [{ type: "social", authProviderId: "google", mode: "popup" }],
        [
          {
            type: "external_wallets",
            walletConnect: { projectId: "29593098b81da471dcb2797df1f50862" },
          }
        ],
      ],
      addPasskeyOnSignup: false,
    },
  }
);
 
export const queryClient = new QueryClient();