import { Suspense, useEffect, useState } from "react";
import { getTweetOne, getTickerOne, getRelation } from "@/api";
import { useLoaderData, useParams } from "react-router";
import { Tweet, Price, TickerData } from "@/utils/types";
import { Heading, Spinner, Flex, Container } from "@chakra-ui/react";
import TokenEChart from "@/components/TokenEChart/index";
import Loading from "@/components/loading";
export default function Ticker() {
  const [data, setData] = useState<TickerData>({
    ticker: "",
    priceData: [],
    tweets: [],
    tweetsRelation: [],
  });
  const [isError, setIsError] = useState<Error>()
  const { ticker } = useLoaderData<TickerData>();
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
            ticker: ticker,
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
          setIsError(error as Error)
        } finally {
          setLoading(false)
        }
      }
    };
    getfetchData();
    // throw new Error("Token Not Found")
  }, [ticker]);

  // if (isError) {
  //   throw isError
  // }
  return (
    <Container maxW="container.lg" py={8}>
      {loading ? <Loading /> :
        <>
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

            <TokenEChart initialData={data} />

          </Suspense>
        </>}
    </Container>
  );
}