import { Outlet } from "react-router";
import Header from "./header";
import { Box, Flex } from "@chakra-ui/react";
import useWallet from "@/hooks/useWallet";
import { useEffect } from "react";
// import { getKols, getTickers } from '@/api';
import { useToken } from '@/hooks/useToken';

export default function Page() {
  const { address } = useWallet()

  const { initToken, handleWalletConnect } = useToken()
  useEffect(() => {
    if (!address) {
      initToken()
    }
  }, [address])

  return <Flex height={'full'} flexDirection={'column'}>
    <Header />
    <Box as={'main'} flex={1} overflow={'auto'} >
      <Outlet />
    </Box>
  </Flex>
}
