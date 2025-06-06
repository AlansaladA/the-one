import { useEffect, useState, useRef } from "react";
import { getTickers, getKols, getRanks, searchTickers, searchKols, getTokenNum } from "@/api";
import { Input, Box, VStack, HStack, Text, Spinner, Flex, Image, Table, Button } from "@chakra-ui/react";
import useDebounce from "@/hooks/useDebounce";
import { shortenAddress } from "@/utils/formatter";
import { TokenList } from "@/utils/types";
import Title from "@/assets/title2.svg"
import Loading from "@/components/loading";
import { Link } from "react-router"
import { Avatar } from "@/components/ui/avatar";
import HomeBg from "@/assets/bg7.png"
import SolanaImg from "@/assets/solana1.svg"
// import {
//   SelectContent,
//   SelectItem,
//   SelectLabel,
//   SelectRoot,
//   SelectTrigger,
//   SelectValueText,
// } from "@/components/ui/select"
import { NativeSelect } from "@chakra-ui/react"


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
import { Ranks } from "@/utils/types"
import { useNavigate } from "react-router";
import { Tabs } from "@chakra-ui/react"

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
  const [tokenNum, setTokenNum] = useState<{ kols_num: number, tokens_num: number }>()
  const [filteredKols, setFilteredKols] = useState<{ url: string, user: string, screen_name: string }[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<TokenList[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openHow, setOpenHow] = useState<boolean>(false)
  const [type, setType] = useState<"Token" | "KOL">("Token")
  const [ranks, setRanks] = useState<Ranks[]>([])
  const [loadRank, setLoadRank] = useState<boolean>(false)
  const navigate = useNavigate()
  const [tab, setTab] = useState<"Kols" | "Address">("Kols")


  useEffect(() => {
    setFilteredKols([])
    setFilteredTokens([])
    if (searchText) {
      checkfilter(searchText)
    }
  }, [searchText])


  const checkfilter = useDebounce(
    async (text: string) => {
      try {
        setLoading(true);
        const [kols, tokens] = await Promise.all([searchKols(text), searchTickers(text)])
        setFilteredKols(kols.tickers.map((v) => ({ url: v.profile_image_url, user: v.user, screen_name: v.self })).slice(0, 10))
        setFilteredTokens(tokens.tickers.map((v) => ({ name: v.pair_name_1, address: v.token_address, num: v.fdv, url: v.token_image_url })).slice(0, 10))
      } catch (error) {
        console.error('搜索失败:', error);
      } finally {
        setLoading(false);
      }
    }, 800)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadRank(true);
        const [ranks, tokenNum] = await Promise.all([getRanks(), getTokenNum()])
        setRanks(ranks.return.slice(0, 20));
        setTokenNum(tokenNum)
      } catch (error) {
        console.error("Error fetching ranks:", error);
      } finally {
        setLoadRank(false);
      }
    };
    fetchData();
  }, []);

  // 添加高亮辅助函数
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <Text as="span" key={index} color="#8181E5" display="inline">
          {part}
        </Text>
      ) : (
        part
      )
    );
  };

  return (
    <Flex
      w={"full"}
      pb={10}
    >
      <Flex w="full" flexDirection={"column"} alignItems={"center"} >
        <Image mt={8} src={Title} ></Image>
        <Text textAlign={"center"} fontSize={{ base: "lg", md: "3xl" }} color={"#fff"} mt={{ base: "-50px", md: "-80px" }} mb={50}>Supporting {tokenNum?.kols_num.toLocaleString()} KOLs and {tokenNum?.tokens_num.toLocaleString()} tokens</Text>
        <Flex mb={{ base: "", md: "" }} position={"relative"} flexDirection={"column"} alignItems={"center"} w="full">
          <Flex
            zIndex={999}
            position={"relative"}
            borderRadius={30}
            bgColor={"#2c2b4a"}
            w={{ base: "70%", sm: "55%", md: "55%", lg: "55%" }}
            // minW={{ base: "auto", lg: "900px" }}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              variant='flushed'
              position="relative"
              zIndex={1000}
              fontSize={{ base: "md", md: "2xl" }}
              textAlign={"center"}
              color={"#8181E5"}
              bgColor="#fff"
              borderRadius="full"
              h={{ base: "50px", md: "70px" }}
              w="full"
              placeholder="Search KOL or Token"></Input>
            {searchText && (
              <Flex h="300px"
                w="full"
                px={5}
                py={5}
                position="absolute"
                top="100%"
                bgColor="#2c2b4a"
                borderRadius="0 0 30px 30px"
                marginTop="-30px"
                zIndex={999}
              >
                {
                  loading ? (
                    <Loading></Loading>
                  ) : <Flex
                    flexDirection={"column"}
                    gap={4}
                    w="full"
                    pt={8}
                    h="full"
                  >
                    <Flex overflowY={"auto"} w="full" flexDirection={"column"} gap={5} h="full">
                      {
                        filteredTokens.length > 0 && <Flex flexDirection={"column"} gap={3}>
                          <Text color="whiteAlpha.500">Tokens</Text>
                          <Flex flexDirection={"column"} gap={3}>
                            {filteredTokens.length > 0 ? (
                              filteredTokens.map((item, index) => {
                                return (
                                  <Link style={{ color: "inherit" }} to={`/token/${item.name}/${item.address}`} key={index}>
                                    <Flex alignItems={"center"} gap={4} cursor={"pointer"}>
                                      <Flex position={"relative"}>
                                        <Avatar src={item.url} size={{ base: "sm", md: "md" }} name={item.name}></Avatar>
                                        <Avatar
                                          src={SolanaImg}
                                          h={"40%"}
                                          w={"40%"}
                                          position={"absolute"}
                                          bottom={0.5}
                                          right={-1}
                                        ></Avatar>
                                      </Flex>

                                      <Text fontWeight="bold" fontSize={{ base: "md", md: "xl" }}>
                                        $
                                        {highlightText(item.name, searchText)}
                                      </Text>
                                      <Text color="whiteAlpha.500" fontSize={{ base: "sm", md: "md" }}>
                                        {item.address}
                                        {/* {highlightText(item.address, searchText)} */}
                                      </Text>
                                    </Flex>
                                  </Link>
                                )
                              })
                            ) : (
                              <Flex alignItems={"center"} gap={4}>
                                <Text fontSize={{ base: "md", md: "xl" }}>Oops! Your Token Seems To Be Hiding.</Text>
                                {/* <Button borderRadius={"full"} onClick={() => { setOpenHow(true), setType("Token") }}>
                              <Text>Request Token</Text>
                            </Button> */}
                              </Flex>
                            )}
                          </Flex>
                        </Flex>
                      }
                      {
                        filteredKols.length > 0 &&
                        <Flex flexDirection={"column"} gap={3}>
                          <Text color="whiteAlpha.500">Kol</Text>
                          <Flex flexDirection={"column"} gap={2}>
                            {filteredKols.length > 0 ? (
                              filteredKols.map((item, index) => {
                                return (
                                  <Link style={{ color: "inherit" }} to={`/detail/${item.screen_name}`} key={index}>
                                    <Flex alignItems={"center"} gap={4} cursor={"pointer"}>
                                      <Avatar src={item.url} size={{ base: "sm", md: "md" }} name={item.user}></Avatar>
                                      <Flex flexDirection={"column"}>
                                        <Text fontSize={{ base: "md", md: "xl" }} fontWeight="bold">
                                          {item.user}
                                        </Text>
                                        <Text color="whiteAlpha.500" fontSize={{ base: "sm", md: "sm" }}>
                                          @{highlightText(item.screen_name, searchText)}
                                        </Text>
                                      </Flex>

                                    </Flex>
                                  </Link>
                                )
                              })
                            ) : (
                              <Flex alignItems={"center"} gap={4}>
                                <Text fontSize={{ base: "md", md: "xl" }}>No KOL Found In The1.</Text>
                                {/* <Button borderRadius={"full"} onClick={() => { setOpenHow(true), setType("KOL") }}>
                              <Text>Request KOL</Text>
                            </Button> */}
                              </Flex>
                            )}
                          </Flex>
                        </Flex>
                      }
                      {
                        !filteredTokens.length && !filteredKols.length && <Box w="full" h="full" display={"flex"} alignItems={"center"} justifyContent={"center"}>Empty</Box>
                      }
                    </Flex>
                  </Flex>
                }
              </Flex>
            )}
          </Flex>
        </Flex>
        <Flex pt={{ base: "40px", md: "140px" }}
          px={{ base: 4, md: 20 }}
          pb={10}
          minH={"400px"}
          w={"full"}
          bgImage={`url(${HomeBg})`}
          backgroundPosition={"top"}
          backgroundRepeat={"no-repeat"}
          // backgroundSize={"100% auto"}
          backgroundSize={"contain"}
          style={{
            backgroundAttachment: "local",
          }}
          justifyContent="center"
        >
          <Flex
            w="full"
            flexDirection={"column"}
            maxW="1800px"
            pb={10}
          >
            <Flex w="full" h={{ base: "4", md: "45" }} mb={5} flexDirection={{ base: "column", md: "row" }}>
              <Box display={"flex"} alignItems={"center"} w={{ base: "100%", md: "35%" }} mb={{ base: 4, md: 0 }} px={{ base: 4, md: 4 }} gap={4}>
                <Flex>
                  {/* <NativeSelect.Root size="xl">
                    <NativeSelect.Field 
                      borderColor="transparent"   
                      as="select"
                      style={{
                        border: 'none',
                        outline: 'none'
                      }}
                      fontSize={{ base: "lg", md: "2xl" }}  
                      _focus={{
                        borderColor: 'transparent',
                        boxShadow: 'none'
                      }}>
                      <option value="1" >Top Kols</option>
                      <option value="2" >Top Address</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root> */}
                  <Text fontSize={{ base: "lg", md: "3xl" }} fontWeight={"bold"}>Top {tab}</Text>
                  <Text display={{ base: "xl", md: "none" }} fontSize={{ base: "lg", md: "3xl" }} >&nbsp;& Calling</Text>
                </Flex>
                {/* <NativeSelect.Root size="sm" w="30%" variant="outline">
                  <NativeSelect.Field>
                    <option value="1">Kol</option>
                    <option value="2">Address</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root> */}
                {/* <Tabs.Root variant="enclosed" w="40%" fitted defaultValue={"Kols"} size={"sm"} onValueChange={(details) => {
                  setTab(details.value as "Kols" | "Address")
                }}>
                  <Tabs.List>
                    <Tabs.Trigger value="Kols">Kol</Tabs.Trigger>
                    <Tabs.Trigger value="Address">Address</Tabs.Trigger>
                  </Tabs.List>
                </Tabs.Root> */}

              </Box>
              <Flex w={{ base: "100%", md: "65%" }} alignItems={"center"} display={{ base: "none", md: "flex" }} px={{ base: 4, md: 4 }}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} mr={2}>Calling</Text>
                <Flex bgColor={"rgba(129, 129, 229, 0.2)"} px={2} borderRadius={3}>
                  <Text fontSize={{ base: "md", md: "lg" }}>peak price increase after call</Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex flexDirection={"column"}
              // overflowY={"auto"} 
              gap={4} maxHeight={{ base: "auto", md: 554 }}>
              <Flex flexDirection={"column"}
                // overflowY={"auto"} 
                gap={4} maxHeight={{ base: "auto", md: 554 }}>
                {loadRank ? <Loading></Loading> :
                  ranks.map((item, index) => (
                    <Flex w="full"
                      key={index}
                      _hover={{ backgroundColor: "rgba(129, 129, 229, 0.2)" }}
                      flexDirection={{ base: "column", md: "row" }}
                      p={{ base: 4, md: 4 }}
                      gap={{ base: 4, md: 2 }}
                      alignItems={"center"}
                    >
                      <Flex w={{ base: "100%", md: "35%" }} alignItems={"center"} gap={8}>
                        <Text fontSize={{ base: "lg", md: "xl" }} w={{ base: "auto", md: "10%" }}>#{index + 1}</Text>
                        <Flex alignItems={"center"} gap={2} flex={1}>
                          <Avatar
                            onClick={() => navigate(`/detail/${item.kol}`)}
                            size={{ base: "lg", md: "xl" }}
                            src={item.profile_link}
                            name={item.kol}
                          />
                          <Flex flexDirection={"column"}>
                            <Text fontSize={{ base: "lg", md: "xl" }}>{item.profile_id}</Text>
                            <Text onClick={() => window.open(`https://x.com/${item.kol}`, '_blank')}
                              cursor={"pointer"}
                              color={"rgba(255,255,255,.4)"}
                            >@{item.kol}</Text>
                          </Flex>
                        </Flex>
                      </Flex>
                      <Flex w={{ base: "100%", md: "65%" }}
                        alignItems={"flex-start"}
                        gap={4}
                        flexWrap={{ base: "wrap", md: "wrap" }}>
                        {[1, 2, 3, 4].map(num => (
                          <Flex key={num}
                            cursor={"pointer"}
                            onClick={() => navigate(`/token/${item[`name_${num}`]}`)}
                            gap={2}
                            alignItems={"center"}
                            textWrap={"nowrap"}
                            bgColor={"rgba(129, 129, 229, 0.2)"}
                            px={2}
                            py={1}
                            borderRadius={3}
                            flex={{ base: "0 0 auto", md: "0 0 auto" }}> {/* 替换原来的 w 属性 */}
                            <Text fontSize={{ base: "md", md: "xl" }}>{`$${item[`name_${num}`]}`}</Text>
                            <Box bgColor={"#6EFFBB"} px={2} borderRadius={3}>
                              <Text fontSize={{ base: "md", md: "xl" }} color={"#000"}>+{item[`value_${num}`]}%</Text>
                            </Box>
                          </Flex>
                        ))}
                      </Flex>
                    </Flex>
                  ))}
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        {/* <RequestModal openHow={openHow} setOpenHow={setOpenHow} type={type}></RequestModal> */}
      </Flex>
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
        <Flex gap={32} flexDirection={"column"} alignItems={"center"} w="full">
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
              _placeholder={{
                color: "rgba(0,0,0,.5)",
              }}
              variant="subtle"
              py={6}
              color={"rgba(0,0,0,.5)"}
              textAlign={"center"}
              bgColor="#fff"
              borderRadius="full"
              w="full"
              placeholder="Enter Token CA"
            />
          </Flex>
          <Button mt={10} borderRadius={"full"} w={"286px"} disabled >Send Request</Button>
        </Flex>
      </DialogBody>
      <DialogCloseTrigger />
    </DialogContent>
  </DialogRoot>
} 