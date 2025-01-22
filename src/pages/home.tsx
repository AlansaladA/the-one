"use client";
import { useEffect, useState } from "react";
import { getTickers, getKols } from "@/api";
import { Input, Box, VStack, HStack, Text, Spinner } from "@chakra-ui/react";
import useDebounce from "@/hooks/useDebounce";
import { shortenAddress } from "@/utils/formatter";
import { TokenList } from "@/utils/types";
// import NextLink from "next/link";

export default function Home() {
  const [kolsList, setKolsList] = useState<string[]>([]);
  const [tokenList, setTokenList] = useState<TokenList[]>([]);
  const [searchText, setSearchText] = useState<string>(""); // 搜索文本
  const [filteredKols, setFilteredKols] = useState<string[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<TokenList[]>([]);
  const [loading, setLoading] = useState(false);

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
    },
    1000
  );

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgImage="url('/bg.png')"
      // bgPosition="center"
      bgRepeat="no-repeat"
      height="600px"
    >

    </Box>
  );
}
