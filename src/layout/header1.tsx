import { Box, ClipboardRoot, Flex, Image, Text, Center, Spinner } from "@chakra-ui/react";
import Logo from "@/assets/logo.svg"
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button"
import { shortenAddress } from "@/utils/formatter";
import DexImg from "@/assets/dexscreener.png"
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"

import { useCallback, useState, useEffect } from "react";
import { useInterval } from "@/hooks/useInterval";
import { fetchLogin } from "@/api";;
import { Storage } from '@/utils/storage';
import { useBreakpointValue } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import useWallet from "@/hooks/useWallet";
import useSolana from "@/hooks/useSolana";


import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useAccount,
  useAuthenticate,
  useUser,
} from "@account-kit/react";

const socialLinks = [
  {
    url: 'https://x.com/the1aiagent',
    icon: <FaXTwitter color="#fff" />,
  },
  {
    url: 'https://dexscreener.com/solana/FfQ99V4Z74397VZBxz2iPfnZMWGeuobdWXpTfcHjuYno',
    icon: <Image src={DexImg} height={{ base: "15px", md: "22px" }} />,
  },
  {
    url: 'https://t.me/the1life',
    icon: <FaTelegramPlane color="#fff" />,
  }
]

export default function Header() {
  const navigate = useNavigate()
  const isMobile = useBreakpointValue({ base: true, md: false });

  const user = useUser();
  
  const { openAuthModal } = useAuthModal();
  const signerStatus = useSignerStatus();
  const { logout } = useLogout()

  const { address, balance, isLogined, login, updateTokenBalance } = useWallet()
  const { getTokenBalance } = useSolana()
  const [balanceloading, setBalanceloading] = useState(false)


  const fetchBalance = useCallback(async () => {
    try {
      if (!user) return
      setBalanceloading(true)
      // console.log(user.address, 'user.address');
      const balance = await getTokenBalance(user.address, import.meta.env.VITE_TOKEN_ADDRESS)
      updateTokenBalance(parseFloat(balance))
    } catch (error) {
      console.log(error);
    } finally {
      setBalanceloading(false)
    }
  }, [user, getTokenBalance, updateTokenBalance])

  // useEffect(() => {
  //   if (address) {
  //     fetchBalance()
  //     fetchLoginApi()
  //   }
  // }, [address])

  // const fetchLoginApi = useCallback(async () => {
  //   try {
  //     if (!address) return
  //     const res = await fetchLogin(address)
  //     Storage.setToken(res.token)
  //     Storage.setWalletAddress(address)
  //     updateTokenLevel(res.token_level)
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [address])

  const logoutBtn = () => {
    logout()
    Storage.removeToken()
    Storage.removeWalletAddress()
    // updateTokenLevel("basic")
  }

  // useInterval(fetchBalance, 5 * 1000)




  return <Flex justifyContent={"space-between"} px='8' height={{ base: '60px', md: '80px' }} alignItems={"center"}>
    <Image cursor={'pointer'} src={Logo} height={{ base: "30px", md: "44px" }} onClick={() => navigate('/')} />
    <Flex alignItems={'center'} gap={2}>
      {isMobile ? (
        <MenuRoot size={"sm"}>
          <MenuTrigger asChild >
            <Button bgColor="transparent" size={"sm"} >
              <FaBars color="#fff" />
            </Button>
          </MenuTrigger>
          <MenuContent>
            {socialLinks.map((link, index) => (
              <MenuItem
                key={index}
                value={link.url}
                onClick={() => window.open(link.url, '_blank')}
              >
                <Flex alignItems="center" gap={2}>
                  {link.icon}
                </Flex>
              </MenuItem>
            ))}
          </MenuContent>
        </MenuRoot>
      ) : (
        socialLinks.map((link, index) => (
          <Button
            key={index}
            bgColor="transparent"
            onClick={() => window.open(link.url, '_blank')}
          >
            {link.icon}
          </Button>
        ))
      )}

      <Box>
        {
          signerStatus.isInitializing ? (
            <Spinner size="sm" color="white" />
          ) : user ? (
            <Flex alignItems={"center"} gap={2}>
              <Flex alignItems={"center"} gap={2}>
                {balanceloading ?
                  <Spinner /> : <Text>
                    {balance}
                  </Text>
                }
                <Text>THE1</Text>
              </Flex>
              <MenuRoot>
                <MenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {shortenAddress(user.address)}
                  </Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuItem value="disconnect" onClick={logoutBtn}>Disconnect</MenuItem>
                </MenuContent>
              </MenuRoot>
            </Flex>
          ) : (
            <Button px={"24px"} borderRadius={"full"} borderColor={"#8181E5"} bgColor={"transparent"} variant={'solid'} onClick={openAuthModal}
            >
              <Text color={"#8181E5"}> Connect</Text>
            </Button>
          )
        }
      </Box>
    </Flex>
  </Flex>
}