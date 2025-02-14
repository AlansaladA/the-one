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

export default function Header() {
  const { address, balance, isLogined, login, logout } = useWallet()
  const navigate = useNavigate()
  return <Flex justifyContent={"space-between"} px='8' height={'80px'} alignItems={"center"}>
    <Image cursor={'pointer'} src={Logo} height={{ base: "30px", md: "44px" }} onClick={() => navigate('/')} />
    <Flex alignItems={'center'} gap={2}>
      <Button bgColor={"transparent"} onClick={() =>  window.open(`https://x.com/the1aiagent`, '_blank')}>
        {/* <Image src={TweetImg} height={{ base: "20px", md: "30px" }}></Image> */}
        <AiFillTwitterCircle color="#fff"/>
      </Button>
      <Button bgColor={"#000"} onClick={() => window.open(`https://dexscreener.com/solana/FfQ99V4Z74397VZBxz2iPfnZMWGeuobdWXpTfcHjuYno`, '_blank')}>
        <Image src={DexImg} height={{ base: "15px", md: "22px" }}></Image>
      </Button>
      <Button bgColor={"#000"} onClick={() => window.open(`https://t.me/the1life`, '_blank')}>
          <FaTelegram color="#fff"/>
      </Button>
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