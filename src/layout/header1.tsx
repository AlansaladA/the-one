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

import useSolana from "@/hooks/useSolana";
import useTokenLevel from "@/hooks/useUser";
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogActionTrigger } from "@/components/ui/dialog";
import AlchemyImg from "@/assets/alchemy.png"
import PhantomImg from "@/assets/phantom.png"
// import useWallet from "@/hooks/useWallet";
// import {
//   useAuthModal,
//   useLogout,
//   useSignerStatus,
//   useAccount,
//   useAuthenticate,
//   useUser,
// } from "@account-kit/react";
import useWalletManager from "@/hooks/useWalletManager";

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


  // const signerStatus = useSignerStatus();

  const { activeWallet, connectWallet, disconnectWallet, getAddress, getBalance, isConnected } = useWalletManager()

  const [open, setOpen] = useState(false)

  const { updateTokenLevel } = useTokenLevel()

  useEffect(() => {
    if (getAddress()) {
      fetchLoginApi()
    }
  }, [getAddress()])

  const fetchLoginApi = useCallback(async () => {
    try {
      if (!getAddress()) return
      const res = await fetchLogin(getAddress() || '')
      Storage.setToken(res.token)
      Storage.setWalletAddress(getAddress() || '')
      updateTokenLevel(res.token_level)
    } catch (error) {
      console.log(error);
    }
    }, [getAddress()])

  // const fetchBalance = useCallback(async () => {
  //   try {
  //     if (!user) return
  //     setBalanceloading(true)
  //     // console.log(user.address, 'user.address');
  //     const balance = await getTokenBalance(user.address, import.meta.env.VITE_TOKEN_ADDRESS)
  //     updateTokenBalance(parseFloat(balance))
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setBalanceloading(false)
  //   }
  // }, [user, getTokenBalance, updateTokenBalance])

  // useEffect(() => {
  //   if (user) {
  //     fetchBalance()
  //     fetchLoginApi()
  //   }
  // }, [user])

  // const fetchLoginApi = useCallback(async () => {
  //   try {
  //     if (!user) return
  //     const res = await fetchLogin(user.address)
  //     Storage.setToken(res.token)
  //     Storage.setWalletAddress(user.address)
  //     updateTokenLevel(res.token_level)
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [user])

  const logoutBtn = () => {
    // logout()
    disconnectWallet()
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


      <DialogRoot placement="center" open={open} >
        <DialogTrigger asChild>
          {isConnected ? <MenuRoot>
            <MenuTrigger asChild>
              <Button variant="outline" size="sm">
                {shortenAddress(getAddress() || '')}
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="disconnect" onClick={logoutBtn}>Disconnect</MenuItem>
            </MenuContent>
          </MenuRoot> : (
            <Button onClick={() => setOpen(true)} px={"24px"} borderRadius={"full"} borderColor={"#8181E5"} bgColor={"transparent"} variant={'solid'}
            >
              <Text color={"#8181E5"}> Connect</Text>
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Wallet</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Flex gap={2} flexDirection={"column"}>
              <Button onClick={() => { connectWallet('alchemy'); setOpen(false) }}>
                <Image src={AlchemyImg} height={"22px"} />
                <Text>alchemy</Text>
              </Button>
              <Button onClick={() => { connectWallet('solana'); setOpen(false) }}>
                <Image src={PhantomImg} height={"22px"} borderRadius={"full"} />
                <Text>Phantom</Text>
              </Button>
            </Flex>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </DialogActionTrigger>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>



    </Flex>
  </Flex>
}