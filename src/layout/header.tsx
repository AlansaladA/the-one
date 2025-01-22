import { Box, ClipboardRoot, Flex, Image, Text, Center } from "@chakra-ui/react";
import Logo from "@/assets/logo.svg"
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button"
import useWallet from "@/hooks/useWallet";
import { shortenAddress } from "@/utils/formatter";
export default function Header() {
  const { address, balance, isLogined, login, logout } = useWallet()
  const navigate = useNavigate()
  return <Flex justifyContent={"space-between"} px='8' height={'80px'} alignItems={"center"}>
    <Image cursor={'pointer'} src={Logo} height={'44px'} onClick={() => navigate('/')} />
    <Flex alignItems={'center'}>
      <Box mr={4}>
        {!isLogined ? (
          <Button variant={'solid'} onClick={() => login()}
          >
            Login
          </Button>
        ) : <Button variant={'solid'}
          onClick={() => logout()}
        >
          Logout
        </Button>}
      </Box>
      {address && <Flex>
        <Text mr={4}>{shortenAddress(address)}</Text>
        <Text>{balance} $theOne</Text>
      </Flex>}
    </Flex>
  </Flex>
}