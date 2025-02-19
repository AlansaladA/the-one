import { Outlet } from "react-router";
import Header from "./header";
import { Box, Flex } from "@chakra-ui/react";
import useWallet from "@/hooks/useWallet";
import { useEffect } from "react";
// import { getKols, getTickers } from '@/api';

export default function Page() {

  return <Flex height={'full'} flexDirection={'column'}>
    <Header />
    <Box as={'main'} flex={1} overflow={'auto'} >
      <Outlet />
    </Box>
  </Flex>

}
