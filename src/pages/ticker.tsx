import { Suspense, useEffect, useState } from "react";
import TokenChart from "@/components/TokenChart";
import { getTweetOne, getTickerOne, getRelation } from "@/api";
import { useParams } from "react-router";
import { Tweet, PriceHistory } from "@/utils/types";
import { Heading, Spinner, Flex, Container } from "@chakra-ui/react";

import TokenChartVisx from '@/components/TokenChartVisx';
type Params = {
  ticker: string;
};

export default function Ticker() {
  const [data, setData] = useState<{
    priceHistory: PriceHistory[];
    tweets: Tweet[];
    tweetsRelation: {
      data: Record<string, string[]>;
      position: string;
    }[];
  }>({
    priceHistory: [],
    tweets: [],
    tweetsRelation: [],
  });

  const { ticker } = useParams<Params>();

  useEffect(() => {
    const getfetchData = async () => {
      if (ticker) {
        try {
          const [priceRes, tweetsRes, tweetsRelation] = await Promise.all([
            getTickerOne(ticker),
            getTweetOne(ticker),
            getRelation(ticker)
          ]);

          setData({
            priceHistory: priceRes.history.map(v => ({
              ...v,
              time: new Date(v.download_time).getTime()
            })), // 根据接口返回的结构调整
            // tweets: tweetsRes.tweets.map(v => {
            //   return {
            //     ...v,
            //     tweet_id: BigInt(v.tweet_id).toString()
            //   }
            // }),
            tweets: tweetsRes.tweets,
            tweetsRelation: tweetsRelation.tweets
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
            <Spinner />
          </Flex>
        }
      >
        <TokenChart initialData={data} />
        {/* <TokenChartVisx initialData={data} /> */}
      </Suspense>
    </Container>
  );
}
