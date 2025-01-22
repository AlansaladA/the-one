import { Box, ClipboardRoot, Flex, Image, Text, Center } from "@chakra-ui/react";
import Logo from "@/assets/logo.svg"
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button"
export default function Header() {
  const navigate = useNavigate()
  return <Flex justifyContent={"space-between"} px='8' height={'80px'} alignItems={"center"}>
       <Image cursor={'pointer'} src={Logo} height={'44px'} onClick={() => navigate('/')} />
       <Flex>
          <Button variant='solid'>
             hhhh
          </Button>
       </Flex>
  </Flex>
}