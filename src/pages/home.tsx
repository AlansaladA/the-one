"use client";
import { useEffect, useState } from "react";
import { getTickers, getKols } from "@/api";
import { Input, Box, VStack, HStack, Text, Spinner, Flex, Image } from "@chakra-ui/react";
import useDebounce from "@/hooks/useDebounce";
import { shortenAddress } from "@/utils/formatter";
import { TokenList } from "@/utils/types";
import Bg from "@/assets/bg.png"
import Title from "@/assets/title.svg"
import Loading from "@/components/loading";
import { Link } from "react-router"
export default function Home() {
  // const [kolsList, setKolsList] = useState<string[]>([]);
  // const [tokenList, setTokenList] = useState<TokenList[]>([]);
  const [searchText, setSearchText] = useState<string>(""); // 搜索文本
  const [filteredKols, setFilteredKols] = useState<string[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<TokenList[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cachedKols = localStorage.getItem("kolsList");
    const cachedTokens = localStorage.getItem("tokenList");

    if (cachedKols && cachedTokens) {
      // setKolsList(JSON.parse(cachedKols));
      // setTokenList(JSON.parse(cachedTokens));
      if (searchText) {
        setLoading(true);
        checkfilter(searchText, JSON.parse(cachedKols), JSON.parse(cachedTokens));
      }
    } else {
      setLoading(true);
      const fetchApi = async () => {
        const [kols, tokens] = await Promise.all([getKols(), getTickers()]);
        console.log(kols, tokens);

        // setKolsList(kols.tickers);

        const uniqueTokens = Array.from(
          new Map(
            tokens.tickers.map(([name, address, num]) => [address, { name, address, num }])
          ).values()
        );

        // setTokenList(uniqueTokens);
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
      <Flex justifyContent={"center"} alignItems={"center"} bgRepeat={"no-repeat"} bgPos={"center"} bgImage={`url(${Bg})`} w="full" h={"700px"}>
        <Flex position={"relative"} flexDirection={"column"} alignItems={"center"} w={"1160px"} h={"262px"} borderRadius="full" borderWidth="1px" borderColor="rgba(255,255,255,0.1)">
          <Image mt={8} src={Title} ></Image>
          <Flex borderRadius={30} bgColor={"#292543"} top={"160px"} position={"absolute"} w="70%" flexDirection={"column"} alignItems={"center"}>
            <Input
              value={searchText}
              onChange={handleInputChange}
              _placeholder={{
                color: "#8181E5", // Placeholder 的颜色
                fontSize: "lg",    // Placeholder 的字体大小
              }} borderWidth="1px" borderColor="#7676E0" fontSize={"lg"} textAlign={"center"} color={"#8181E5"} bgColor="#fff" borderRadius="full" h="70px" w="full" placeholder="Search your interest kol or Token"></Input>
            {searchText && (
              <Flex h="300px" w="full" px={5} py={5}>
                {
                  loading ? (
                    <Loading></Loading>
                  ) : <Flex overflowY={"auto"} flexDirection={"column"} gap={4} w="full">
                    <Flex flexDirection={"column"} gap={3}>

                      <Text color="whiteAlpha.500">Token</Text>
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
                          <Text>No results found in Kols</Text>
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
                          <Text>No results found in Kols</Text>
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                }
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
