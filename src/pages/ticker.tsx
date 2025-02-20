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
import userUser from "@/hooks/useUser";

export default function Ticker() {
  const [data, setData] = useState<TickerData>({
    ticker: "",
    priceData: [],
    tweets: [],
    tweetsRelation: [],
  });
  const [isError, setIsError] = useState<Error>()
  const { ticker } = useLoaderData<TickerData>();
  const [loading, setLoading] = useState(false);
  const { address } = useWallet()
  const { token_level } = userUser()



  useEffect(() => {
    const getfetchData = async () => {
      if (ticker && token_level) {

        setLoading(true)
        try {
          const [priceRes, tweetsRes, tweetsRelation] = await Promise.all([
            token_level === TokenLevel.ADVANCED ? getHistoryAdvanced(ticker) : getHistoryBasic(ticker),
            token_level === TokenLevel.ADVANCED ? getTweetAdvanced(ticker) : getTweetBasic(ticker),
            getRelation(ticker)
          ]);
         
          const processedTweets = await preloadImages(tweetsRes.tweets);

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
  }, [ticker, token_level]);

  // if (isError) {
  //   throw isError
  // }
  // if(!address){
  //   return <Container maxW="container.lg" py={8} height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
  //     <Heading size="2xl" mb={8} textAlign="left">
  //       Please connect your wallet
  //     </Heading>
  //   </Container>
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