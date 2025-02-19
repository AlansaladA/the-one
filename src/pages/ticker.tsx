import { Suspense, useEffect, useState, useCallback } from "react";
import { getTweetOne, getTickerOne, getRelation,getTweetBasic,getTweetAdvanced,getHistoryBasic,getHistoryAdvanced } from "@/api";
import { useLoaderData, useParams } from "react-router";
import { Tweet, Price, TickerData, TokenLevel } from "@/utils/types";
import { Heading, Spinner, Flex, Container } from "@chakra-ui/react";
import TokenEChart from "@/components/TokenEChart/index";
import Loading from "@/components/loading";
import { preloadImages } from "@/utils";
import useSolana from "@/hooks/useSolana";
import useWallet from "@/hooks/useWallet";
import useToken from "@/hooks/useToken";

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
  const { getTokenBalance } = useSolana()
  const { address } = useWallet()
  const { token_level } = useToken()



  useEffect(() => {
    const getfetchData = async () => {
      if (ticker && address && token_level) {
        
        setLoading(true)
        try {
          const [priceRes, tweetsRes, tweetsRelation] = await Promise.all([
            token_level === TokenLevel.BASIC ? getHistoryBasic(ticker) : getHistoryAdvanced(ticker),
            token_level === TokenLevel.BASIC ? getTweetBasic(ticker, address) : getTweetAdvanced(ticker, address),
            getRelation(ticker)
          ]);
         
          const processedTweets = await preloadImages(tweetsRes.tweets);


          // const firstTime = new Date(priceRes.history[0].download_time).getTime();
          // const mockHistoryData = Array.from({ length: priceRes.history.length }).map((_, index) => ({
          //   time: firstTime - ((index + 1) * 60 * 60 * 1000), // 每小时递减
          //   price: 0,
          //   volume: 0,
          //   name: priceRes.history[0].name,
          //   isMock: true
          // }));

          // const lastTime = new Date(priceRes.history[priceRes.history.length - 1].download_time).getTime();
          // const mockFutureData = Array.from({ length: priceRes.history.length }).map((_, index) => ({
          //   time: lastTime + ((index + 1) * 60 * 60 * 1000), // 每小时递增
          //   price: 0,
          //   volume: 0,
          //   name: priceRes.history[0].name,
          //   isMock: true
          // }));
          
          setData({
            ticker: ticker,
            priceData: [
              ...priceRes.history.map((item) => ({
                time: new Date(item.download_time).getTime(),
                price: parseFloat(item.close),
                volume: parseFloat(item.volume),
                name: item.name,
              })),
            ],
            tweets: processedTweets.filter((tweet) =>
              new Date(tweet.created_at).getTime() >= new Date(priceRes.history[0].download_time).getTime()
            ),
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
  }, [ticker, address,token_level]);

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