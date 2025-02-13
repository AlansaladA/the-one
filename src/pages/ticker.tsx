import { Suspense, useEffect, useState } from "react";
import { getTweetOne, getTickerOne, getRelation } from "@/api";
import { useParams } from "react-router";
import { Tweet, Price } from "@/utils/types";
import { Heading, Spinner, Flex, Container } from "@chakra-ui/react";
import TokenEChart from "@/components/TokenEChart/index";
import Loading from "@/components/loading";

// import TokenChartVisx from '@/components/TokenChartVisx';
type Params = {
  ticker: string;
};

export default function Ticker() {
  const [data, setData] = useState<{
    priceData: Price[];
    tweets: Tweet[];
    tweetsRelation: {
      data: Record<string, string[]>;
      position: string;
    }[];
  }>({
    priceData: [],
    tweets: [],
    tweetsRelation: [],
  });

  const { ticker } = useParams<Params>();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getfetchData = async () => {
      if (ticker) {
        setLoading(true)
        try {
          const [priceRes, tweetsRes, tweetsRelation] = await Promise.all([
            getTickerOne(ticker),
            getTweetOne(ticker),
            getRelation(ticker)
          ]);

          setData({
            priceData: priceRes.history.map((item) => ({
              time: new Date(item.download_time).getTime(),
              price: parseFloat(item.close),
              volume: parseFloat(item.volume),
              name: item.name,
            })), // 根据接口返回的结构调整  
            tweets: tweetsRes.tweets.filter((tweet) => new Date(tweet.created_at).getTime() >= new Date(priceRes.history[0].download_time).getTime()),
            tweetsRelation: tweetsRelation.tweets
          });
        } catch (error) {
          console.error(error); // 记录错误信息
        } finally {
          setLoading(false)
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
        {
          loading ? <Loading /> : <TokenEChart initialData={data} />
        }
      </Suspense>
    </Container>
  );
}