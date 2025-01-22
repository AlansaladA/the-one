"use client";

import { Suspense, useEffect, useState } from "react";
import TokenChart from "@/components/TokenChart";
import { getTweetOne, getTickerOne } from "@/api";
import { useParams } from "react-router";
import { Tweet, PriceHistory } from "@/utils/types";
import { Box, Heading, Spinner, Flex, Container } from "@chakra-ui/react";

type Params = {
  ticker: string;
};

export default function Ticker() {
  const [data, setData] = useState<{
    priceHistory: PriceHistory[];
    tweets: Tweet[];
  }>({
    priceHistory: [],
    tweets: [],
  });

  const { ticker } = useParams<Params>();

  useEffect(() => {
    const getfetchData = async () => {
      if (ticker) {
        try {
          const [priceRes, tweetsRes] = await Promise.all([
            getTickerOne(ticker),
            getTweetOne(ticker),
          ]);
          setData({
            priceHistory: priceRes.history, // 根据接口返回的结构调整
            tweets: tweetsRes.tweets, // 根据接口返回的结构调整
          });
        } catch (error) {
          console.error(error); // 记录错误信息
        }
      }
    };
    getfetchData();
  }, [ticker]);

  return (
    <Container maxW="container.lg" py={8}>
      <Heading size="2xl" mb={8} textAlign="left">
        ${ticker?.toUpperCase()}
      </Heading>

      <Suspense
        fallback={
          <Flex align="center" justify="center" h="600px">
            <Spinner  />
          </Flex>
        }
      >
        <TokenChart initialData={data} />
      </Suspense>
    </Container>
  );
}
