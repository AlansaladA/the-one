import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { ChakraProvider } from '@chakra-ui/react';
import { RouterProvider } from "react-router";
import router from './route';

import { system } from './lib/system/index.ts';
function App() {

  return (
    <ChakraProvider value={system}>
        <RouterProvider router={router} />
     </ChakraProvider>
  )
}

export default App