import { Box, ClipboardRoot, Flex, Image, Text, Center } from "@chakra-ui/react";
import Logo from "@/assets/logo.svg"
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button"
import useWallet from "@/hooks/useWallet";
import { shortenAddress } from "@/utils/formatter";
import TweetImg from "@/assets/tweet.png"
import DexImg from "@/assets/dexscreener.png"
import { FaTelegram } from "react-icons/fa";
import { AiFillTwitterCircle } from "react-icons/ai";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

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
  const { address, balance, isLogined, login, logout } = useWallet()
  const navigate = useNavigate()
  return <Flex justifyContent={"space-between"} px='8' height={{ base: '60px', md: '80px' }} alignItems={"center"}>
    <Image cursor={'pointer'} src={Logo} height={{ base: "30px", md: "44px" }} onClick={() => navigate('/')} />
    <Flex alignItems={'center'} gap={2}>
      {socialLinks.map((link, index) => (
        <Button
          key={index}
          bgColor="transparent"
          onClick={() => window.open(link.url, '_blank')}
        >
          {link.icon}
        </Button>
      ))}
      {/* <Box mr={4}>
        {!isLogined ? (
          <Button px={"24px"} borderRadius={"full"} borderColor={"#8181E5"} bgColor={"transparent"} variant={'solid'} onClick={() => login()}
          >
            <Text color={"#8181E5"}>Login</Text>
          </Button>
        ) : <Button variant={'solid'}
          onClick={() => logout()}
        >
          <Text color={"white"}>Logout</Text>
        </Button>}
      </Box>
      {address && <Flex>
        <Text mr={4}>{shortenAddress(address)}</Text>
        <Text>{balance} $theOne</Text>
      </Flex>} */}

    </Flex>
  </Flex>
}