import { Outlet } from "react-router";
import Header from "./header";
import { Box, Flex } from "@chakra-ui/react";
import useWallet from "@/hooks/useWallet";
import useSolana from "@/hooks/useSolana";
import { useEffect } from "react";
import { getKols, getTickers } from '@/api'; 

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

  useEffect(() => {
    const updateCache = async () => {
      try {
        const [kols, ticks] = await Promise.all([getKols(), getTickers()]);
        const filterList = Array.from(
          new Map(ticks.tickers.map(([name, address, num]) => [
            address,
            { name, address, num }
          ])).values()
        );
        
        localStorage.setItem("kolsList", JSON.stringify(kols.tickers));
        localStorage.setItem("tokenList", JSON.stringify(filterList));
      } catch (error) {
        console.error('缓存更新失败:', error);
      }
    };
    updateCache();
    const interval = setInterval(updateCache, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [])
  

  return <Flex height={'full'} flexDirection={'column'}>
  <Header />
  <Box as={'main'} flex={1} overflow={'auto'} >
    <Outlet />
  </Box>
</Flex>
}
