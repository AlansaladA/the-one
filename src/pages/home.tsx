"use client";
import { useEffect, useState, useRef } from "react";
import { getTickers, getKols } from "@/api";
import { Input, Box, VStack, HStack, Text, Spinner, Flex, Image, Table, Button } from "@chakra-ui/react";
import useDebounce from "@/hooks/useDebounce";
import { shortenAddress } from "@/utils/formatter";
import { TokenList } from "@/utils/types";
// import Bg from "@/assets/bg.png"
import Title from "@/assets/title2.svg"
import Loading from "@/components/loading";
import { Link } from "react-router"
import { Avatar } from "@/components/ui/avatar";
import HomeBg from "@/assets/bg6.png"
import HomeBg2 from "@/assets/bg1.png"
import {
  DialogHeader,
  DialogBody,
  DialogContent,
  DialogRoot,
  DialogTitle, DialogCloseTrigger
} from "@/components/ui/dialog"

import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu"

import BnB from "@/assets/bnb.svg"
import Base from "@/assets/base.svg"
import Ethereum from "@/assets/ethereum.svg"
import Optimism from "@/assets/optimism.svg"
import Solana from "@/assets/solana.svg"

const items = [
  { id: 1, name: "Laptop", category: "Electronics", price: 999.99 },
  { id: 2, name: "Coffee Maker", category: "Home Appliances", price: 49.99 },
  { id: 3, name: "Desk Chair", category: "Furniture", price: 150.0 },
  { id: 4, name: "Smartphone", category: "Electronics", price: 799.99 },
  { id: 5, name: "Headphones", category: "Accessories", price: 199.99 },
  { id: 1, name: "Laptop", category: "Electronics", price: 999.99 },
  { id: 2, name: "Coffee Maker", category: "Home Appliances", price: 49.99 },
  { id: 3, name: "Desk Chair", category: "Furniture", price: 150.0 },
  { id: 4, name: "Smartphone", category: "Electronics", price: 799.99 },
  { id: 5, name: "Headphones", category: "Accessories", price: 199.99 },
  { id: 1, name: "Laptop", category: "Electronics", price: 999.99 },
  { id: 2, name: "Coffee Maker", category: "Home Appliances", price: 49.99 },
  { id: 3, name: "Desk Chair", category: "Furniture", price: 150.0 },
  { id: 4, name: "Smartphone", category: "Electronics", price: 799.99 },
  { id: 5, name: "Headphones", category: "Accessories", price: 199.99 },
]

const list = [
  {
    name: "Solana",
    url: Solana,
    value: "1"
  },
  {
    name: "Base",
    url: Base,
    value: "2"
  },
  {
    name: "Ethereum",
    url: Ethereum,
    value: "3"
  },
  {
    name: "Optimism",
    url: Optimism,
    value: "4"
  },
  {
    name: "BNB",
    url: BnB,
    value: "5"
  }
]

export default function Home() {
  const [kolsList, setKolsList] = useState<string[]>([]);
  const [tokenList, setTokenList] = useState<TokenList[]>([]);
  const [searchText, setSearchText] = useState<string>(""); // 搜索文本
  const [filteredKols, setFilteredKols] = useState<string[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<TokenList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openHow, setOpenHow] = useState<boolean>(false)
  const [type, setType] = useState<"Token" | "KOL">("Token")

  useEffect(() => {
    const cachedKols = localStorage.getItem("kolsList");
    const cachedTokens = localStorage.getItem("tokenList");

    if (cachedKols && cachedTokens) {
      setKolsList(JSON.parse(cachedKols));
      setTokenList(JSON.parse(cachedTokens));
      if (searchText) {
        setLoading(true);
        checkfilter(searchText, JSON.parse(cachedKols), JSON.parse(cachedTokens));
      }
    } else {
      setLoading(true);
      const fetchApi = async () => {
        const [kols, tokens] = await Promise.all([getKols(), getTickers()]);
        console.log(kols, tokens);

        setKolsList(kols.tickers);

        const uniqueTokens = Array.from(
          new Map(
            tokens.tickers.map(([name, address, num]) => [address, { name, address, num }])
          ).values()
        );

        setTokenList(uniqueTokens);
        if (searchText) {
          checkfilter(searchText, kols.tickers, uniqueTokens);
        }

        localStorage.setItem("kolsList", JSON.stringify(kols.tickers));
        localStorage.setItem("tokenList", JSON.stringify(uniqueTokens));
      };
      fetchApi();
    }
  }, [searchText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const checkfilter = useDebounce(
    (text: string, kolList: string[], tokenList: TokenList[]) => {
      const kolsFiltered = kolList.filter((item) =>
        item.toLowerCase().includes(text.toLowerCase())
      );
      const tokensFiltered = tokenList.filter(
        (item) =>
          item.name.toLowerCase().includes(text.toLowerCase()) ||
          item.address.toLowerCase().includes(text.toLowerCase())
      );

      setTimeout(() => {
        setLoading(false);
        setFilteredKols(kolsFiltered);
        setFilteredTokens(tokensFiltered);
      }, 1000);
    }, 1000)

  return (
    <Flex w={"full"} h={"full"} >
      <Flex w="full" flexDirection={"column"} alignItems={"center"} >
        <Image mt={8} src={Title} ></Image>
        <Text fontSize={"3xl"} color={"#9595E5"} mt={"-80px"} mb={50}>Supporting {kolsList.length.toLocaleString()} KOLs and {tokenList.length.toLocaleString()} tokens</Text>
        <Flex mb={"70px"} position={"relative"} flexDirection={"column"} alignItems={"center"} w="full">
          <Flex minW={"900px"} position={"absolute"} borderRadius={30} bgColor={"#292543"} w="55%" flexDirection={"column"} alignItems={"center"}>
            <Input
              value={searchText}
              onChange={handleInputChange}
              outline={"none"}
              _placeholder={{
                color: "#8181E5", // Placeholder 的颜色
                fontSize: "lg",    // Placeholder 的字体大小
              }} borderWidth="1px" borderColor="#7676E0" fontSize={"lg"} textAlign={"center"} color={"#8181E5"} bgColor="#fff" borderRadius="full" h="70px" w="full" placeholder="Search KOL or Token"></Input>
            {searchText && (
              <Flex h="300px" w="full" px={5} py={5}>
                {
                  loading ? (
                    <Loading></Loading>
                  ) : <Flex overflowY={"auto"} flexDirection={"column"} gap={4} w="full">
                    <Flex flexDirection={"column"} gap={3}>
                      <Text color="whiteAlpha.500">Tokens</Text>
                      <Flex flexDirection={"column"} gap={2}>
                        {filteredTokens.length > 0 ? (
                          filteredTokens.map((item, index) => {
                            return (
                              <Link style={{ color: "inherit" }} to={`/token/${item.name}`} key={index}>
                                <Flex className="flex gap-2 items-center" gap={8} cursor={"pointer"}>
                                  {/* <Image src={"/token.svg"} width={28} height={28} alt=""></Image> */}
                                  <Text fontWeight="bold">{item.name}</Text>
                                  <Text color="whiteAlpha.500" className="text-xs text-zinc-400 opacity-2">{shortenAddress(item.address)}</Text>
                                </Flex>
                              </Link>
                            )
                          })
                        ) : (
                          <Flex alignItems={"center"} gap={4}>
                            <Text>Oops! Your Token Seems To Be Hiding.</Text>
                            <Button borderRadius={"full"} onClick={() => { setOpenHow(true), setType("Token") }}>
                              <Text>Request Token</Text>
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    </Flex>
                    <Box w="full" h="1px" bg={"rgba(255,255,255,0.3)"}></Box>
                    <Flex flexDirection={"column"} gap={3}>
                      <Text color="whiteAlpha.500">Kol</Text>
                      <Flex flexDirection={"column"} gap={2}>
                        {filteredKols.length > 0 ? (
                          filteredKols.map((item, index) => {
                            return (
                              <Link style={{ color: "inherit" }} to={`/detail/${item}`} key={index}>
                                <Flex className="flex gap-2 items-center" cursor={"pointer"}>
                                  {/* <Image src={"/token.svg"} width={28} height={28} alt=""></Image> */}
                                  <Text fontWeight="bold">{item}</Text>
                                </Flex>
                              </Link>
                            )
                          })
                        ) : (
                          <Flex alignItems={"center"} gap={4}>
                            <Text>No KOL Found In The1.</Text>
                            <Button borderRadius={"full"} onClick={() => { setOpenHow(true), setType("KOL") }}>
                              <Text>Request KOL</Text>
                            </Button>
                          </Flex>
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                }
              </Flex>
            )}
          </Flex>
        </Flex>
        <Flex pt="120px" px={20} pb={10} minHeight={"550px"} h={"full"}  w={"full"} bgImage={`url(${HomeBg})`} backgroundPosition={"center"} backgroundSize={"cover"}>
          {/* <Flex w="full" flexDirection={"column"}>
            <Flex w="full" h={45} mb={5}>
              <Box w={"30%"}>
                <Text fontSize={"3xl"} fontWeight={"bold"}>Top KOLs</Text>
              </Box>
              <Flex w={"70%"} alignItems={"center"}>
                <Text fontSize={"3xl"} mr={2}>Calling</Text>
                <Text fontSize={"xl"}>{"(peak price increase after call)"}</Text>
              </Flex>
            </Flex> 
            <Flex  flexDirection={"column"} overflowY={"auto"} gap={4} maxHeight={554}>
            {
              new Array(10).fill(0).map((v, index) => {
                return <Flex w="full" h={45} key={index}>
                  <Flex w={"30%"} alignItems={"center"} gap={8}>
                    <Text fontSize={"xl"}>#1</Text>
                    <Flex alignItems={"center"} gap={2}>
                      <Avatar size={"xl"}></Avatar>
                      <Flex flexDirection={"column"} >
                        <Text fontSize={"xl"}>OxWizard</Text>
                        <Text color={"rgba(255,255,255,.4)"}>@OxWizard</Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex w={"70%"} alignItems={"center"} gap={4}>
                    <Flex >
                      <Text fontSize={"xl"}>{"$Trump ("}</Text>
                      <Text fontSize={"xl"} color={"green.400"}>+1709.32%</Text>
                      <Text fontSize={"xl"}>{"),"}</Text>
                    </Flex>
                    <Flex >
                      <Text fontSize={"xl"}>{"$Trump ("}</Text>
                      <Text fontSize={"xl"} color={"green.400"}>+1709.32%</Text>
                      <Text fontSize={"xl"}>{"),"}</Text>
                    </Flex>
                    <Flex >
                      <Text fontSize={"xl"}>{"$Trump ("}</Text>
                      <Text fontSize={"xl"} color={"green.400"}>+1709.32%</Text>
                      <Text fontSize={"xl"}>{"),"}</Text>
                    </Flex>
                    <Flex >
                      <Text fontSize={"xl"}>{"$Trump ("}</Text>
                      <Text fontSize={"xl"} color={"green.400"}>+1709.32%</Text>
                      <Text fontSize={"xl"}>{"),"}</Text>
                    </Flex>
                  </Flex>
                </Flex>
              })
            }
            </Flex>
          </Flex> */}
        </Flex>
      </Flex>

      <RequestModal openHow={openHow} setOpenHow={setOpenHow} type={type}></RequestModal>
    </Flex>
  );
}


function RequestModal({ openHow, setOpenHow, type }: {
  openHow: boolean,
  setOpenHow: (value: boolean) => void,
  type: "Token" | "KOL",
}) {
  const contentRef = useRef<HTMLDivElement>(null)

  return <DialogRoot size={'xl'} placement={'center'} open={openHow} onOpenChange={(e) => setOpenHow(e.open)}>
    <DialogContent minWidth={"896px"} ref={contentRef} style={{ backgroundColor: '#2D2D4F', color: 'white', borderRadius: '18px', }}>
      <DialogHeader >
        <DialogTitle>Request {type}</DialogTitle>
      </DialogHeader>
      <DialogBody asChild>
        <Flex gap={32} flexDirection={"column"} alignItems={"center"}>
          <Flex flexDirection={"column"} gap={4} w="full">
            {
              type == "Token" && <MenuRoot>
                <MenuTrigger asChild>
                  <Button bgColor={"#fff"} size="sm" w="full" borderRadius={"full"} py={6}>
                    Choose Token NetWork
                  </Button>
                </MenuTrigger>
                <MenuContent minW={"848px"} borderRadius={15} portalRef={contentRef} w="full" bgColor="#fff" >
                  {
                    list.map((v => {
                      return <MenuItem value={v.value} key={v.value}>
                        <Flex color={"#000"} fontSize={"lg"} alignItems={"center"} gap={2}>
                          <Avatar src={v.url} size={"sm"}></Avatar>
                          <Text>{v.name}</Text>
                        </Flex>
                      </MenuItem>
                    }))
                  }

                </MenuContent>
              </MenuRoot>
            }
            <Input
              // value={searchText}
              // onChange={handleInputChange}
              outline={"none"}
              _placeholder={{
                color: "rgba(0,0,0,.5)", // Placeholder 的颜色
              }} py={6} color={"rgba(0,0,0,.5)"} textAlign={"center"} bgColor="#fff" borderRadius="full" w="full" placeholder="Enter Token CA"></Input>
          </Flex>
          <Button mt={10} borderRadius={"full"} w={"286px"}>Send Request</Button>
        </Flex>
      </DialogBody>
      <DialogCloseTrigger />
    </DialogContent>
  </DialogRoot>
}
