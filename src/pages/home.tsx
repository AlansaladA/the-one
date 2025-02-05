import { useEffect, useState, useRef } from "react";
import { getTickers, getKols, getRanks } from "@/api";
import { Input, Box, VStack, HStack, Text, Spinner, Flex, Image, Table, Button } from "@chakra-ui/react";
import useDebounce from "@/hooks/useDebounce";
import { shortenAddress } from "@/utils/formatter";
import { TokenList } from "@/utils/types";
import Title from "@/assets/title2.svg"
import Loading from "@/components/loading";
import { Link } from "react-router"
import { Avatar } from "@/components/ui/avatar";
import HomeBg from "@/assets/bg7.png"
import SolanaImg from "@/assets/solana.png"
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
  const [ranks, setRanks] = useState<Ranks[]>([])
  const [loadRank, setLoadRank] = useState<boolean>(false)
  const navigate = useNavigate()
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

        const uniqueTokens = tokens.tickers.map(([name, address, num]) => ({ name, address, num }));

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

  useEffect(() => {
    const updateCache = async () => {
      try {
        const [kols, ticks] = await Promise.all([getKols(), getTickers()]);
        const filterList = ticks.tickers.map(([name, address, num]) => ({ name, address, num }))

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadRank(true);
        const res = await getRanks();
        setRanks(res.return.slice(0, 20));
      } catch (error) {
        console.error("Error fetching ranks:", error);
      } finally {
        setLoadRank(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Flex w={"full"} h={"full"} >
      <Flex w="full" flexDirection={"column"} alignItems={"center"} >
        <Image mt={8} src={Title} ></Image>
        <Text textAlign={"center"} fontSize={{ base: "lg", md: "3xl" }} color={"#fff"} mt={{ base: "-50px", md: "-80px" }} mb={50}>Supporting {kolsList.length.toLocaleString()} KOLs and {tokenList.length.toLocaleString()} tokens</Text>
        <Flex mb={{ base: "", md: "" }} position={"relative"} flexDirection={"column"} alignItems={"center"} w="full">
          <Flex
            zIndex={999}
            position={"relative"}
            borderRadius={30}
            bgColor={"#2c2b4a"}
            w={{ base: "90%", sm: "80%", md: "70%", lg: "55%" }}
            minW={{ base: "auto", lg: "900px" }}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <Input
              value={searchText}
              onChange={handleInputChange}
              outline={"none"}
              _placeholder={{
                color: "#8181E5",
                fontSize: { base: "md", md: "2xl" },
              }}
              position="relative"
              zIndex={1000}
              borderWidth="1px"
              borderColor="#7676E0"
              fontSize={{ base: "md", md: "2xl" }} textAlign={"center"} color={"#8181E5"} bgColor="#fff" borderRadius="full" h={{ base: "50px", md: "70px" }} w="full" placeholder="Search KOL or Token"></Input>

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
                  >
                    <Flex overflowY={"auto"} w="full" flexDirection={"column"} gap={3}>
                      <Flex flexDirection={"column"} gap={3}>
                        <Text color="whiteAlpha.500">Tokens</Text>
                        <Flex flexDirection={"column"} gap={3}>
                          {filteredTokens.length > 0 ? (
                            filteredTokens.map((item, index) => {
                              return (
                                <Link style={{ color: "inherit" }} to={`/token/${item.name}`} key={index}>
                                  <Flex alignItems={"center"} gap={4} cursor={"pointer"}>
                                    <Avatar src={SolanaImg} size={{ base: "sm", md: "md" }}></Avatar>
                                    <Text fontWeight="bold" fontSize={{ base: "md", md: "xl" }}>{"$" + item.name}</Text>
                                    <Text color="whiteAlpha.500" fontSize={{ base: "sm", md: "md" }} className="text-xs  opacity-2">{(item.address)}</Text>
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
                                    <Text fontSize={{ base: "md", md: "xl" }} fontWeight="bold">{item}</Text>
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
          minHeight={{ base: "100vh", md: "550px" }}
          h={"full"}
          w={"full"}
          bgImage={`url(${HomeBg})`}
          backgroundPosition={"top"}
          backgroundRepeat={"no-repeat"}
          backgroundSize={{ base: "contain", md: "cover" }}
          justifyContent="center"
        >
          <Flex
            w="full"
            flexDirection={"column"}
            maxW="1800px"
          >
            <Flex w="full" h={{ base: "4", md: "45" }} mb={5} flexDirection={{ base: "column", md: "row" }}>
              <Box display={"flex"} alignItems={"center"} w={{ base: "100%", md: "35%" }} mb={{ base: 4, md: 0 }}>
                <Text fontSize={{ base: "xl", md: "3xl" }} fontWeight={"bold"}>Top KOLs</Text>
                <Text display={{ base: "xl", md: "none" }} fontSize={{ base: "xl", md: "3xl" }}>&nbsp;& Calling</Text>
              </Box>
              <Flex w={{ base: "100%", md: "65%" }} alignItems={"center"} display={{ base: "none", md: "flex" }}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} mr={2}>Calling</Text>
                <Flex bgColor={"rgba(129, 129, 229, 0.2)"} px={2} borderRadius={3}>
                  <Text fontSize={{ base: "md", md: "lg" }}>peak price increase after call</Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex flexDirection={"column"} overflowY={"auto"} gap={4} maxHeight={{ base: "auto", md: 554 }}>
              {loadRank ? <Loading></Loading> :
                ranks.map((item, index) => (
                  <Flex w="full"
                    key={index}
                    _hover={{ backgroundColor: "rgba(129, 129, 229, 0.2)" }}
                    flexDirection={{ base: "column", md: "row" }}
                    p={{ base: 4, md: 0 }}
                    gap={{ base: 4, md: 0 }}>
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
