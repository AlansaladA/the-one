import { ChakraProvider } from '@chakra-ui/react';
import { RouterProvider } from "react-router/dom";
import router from './route';

import { system } from './lib/system/index.ts';
import { PrivyProvider } from '@privy-io/react-auth';
import { privyConfig } from './lib/consts/privyConfig.ts';
import { Provider as StoreProvider } from 'react-redux';
import store from './store/index.ts';
import { ColorModeProvider } from './components/ui/color-mode.tsx';

import { AlchemyClientState } from "@account-kit/core";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { config, queryClient } from "@/lib/consts/alchemyConfig";

function App() {

  return (
    <StoreProvider store={store}>
      <PrivyProvider appId="cm5xpkij608f1opr0y5cc8uhf"
        config={privyConfig}>

        <QueryClientProvider client={queryClient}>
          <AlchemyAccountProvider config={config} queryClient={queryClient} >
            <ChakraProvider value={system}>
              <ColorModeProvider forcedTheme='dark'>
                <RouterProvider router={router} />
              </ColorModeProvider>
            </ChakraProvider>
          </AlchemyAccountProvider>
        </QueryClientProvider>


      </PrivyProvider>
    </StoreProvider>
  )
}

export default App