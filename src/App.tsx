import { ChakraProvider } from '@chakra-ui/react';
import { RouterProvider } from "react-router/dom";
import router from './route';

import { system } from './lib/system/index.ts';
import { PrivyProvider } from '@privy-io/react-auth';
import { privyConfig } from './lib/consts/privyConfig.ts';
import { Provider as StoreProvider } from 'react-redux';
import store from './store/index.ts';
import { ColorModeProvider } from './components/ui/color-mode.tsx';

import { AlchemyClientState, cookieToInitialState } from "@account-kit/core";
import { AlchemyAccountProvider } from "@account-kit/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { config, queryClient } from "@/lib/consts/alchemyConfig";
import Cookies from 'js-cookie';
function App() {


  return (
    <StoreProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider appId="cm5xpkij608f1opr0y5cc8uhf"
          config={privyConfig}>

          <AlchemyAccountProvider config={config} queryClient={queryClient} >
            <ChakraProvider value={system}>
              <ColorModeProvider forcedTheme='dark'>
                <RouterProvider router={router} />
              </ColorModeProvider>
            </ChakraProvider>
          </AlchemyAccountProvider>

        </PrivyProvider>
      </QueryClientProvider>
    </StoreProvider>
  )
}

export default App