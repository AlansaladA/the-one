import { Outlet } from "react-router";
import Header from "./header";
import { Box, Flex } from "@chakra-ui/react";
import useWallet from "@/hooks/useWallet";
import useSolana from "@/hooks/useSolana";
import { useEffect } from "react";


export default function Page() {
  const { updateTokenBalance, address } = useWallet()
  // const { getTokenBalance } = useSolana()

  // const fetxhBalance = async (addr: string) => {
  //   try {

  //     const balance = await getTokenBalance(addr, import.meta.env.VITE_TOKEN_ADDRESS)
  //     updateTokenBalance(parseFloat(balance))
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // useEffect(() => {
  //   if (address) {
  //     fetxhBalance(address)
  //   }
  // }, [address])
  
  return <Flex height={'full'} flexDirection={'column'}>
  <Header />
  <Box as={'main'} flex={1} overflow={'auto'} px={20}>
    <Outlet />
  </Box>
</Flex>
}