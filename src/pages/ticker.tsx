import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { getTweetOne, getTickerOne, getRelation, getTweetBasic, getTweetAdvanced, getHistoryBasic, getHistoryAdvanced,getAddressInfo } from "@/api";
import { useLoaderData, useParams } from "react-router";
import { Tweet, Price, TickerData, TokenLevel } from "@/utils/types";
import { Heading, Spinner, Flex, Container, Box, Text, Icon } from "@chakra-ui/react";
import TokenEChart from "@/components/TokenEChart/index";
import Loading from "@/components/loading";
import { preloadImages } from "@/utils";
import useSolana from "@/hooks/useSolana";
import useWallet from "@/hooks/useWallet";
import userUser from "@/hooks/useUser";
import HeatMap from "@/components/HeatMap/index";
import { FaTwitter, FaCoins } from "react-icons/fa";
import { useTrade } from "@/hooks/useTrade";
import { useWebSocket } from "@/hooks/useWebSocket";
import { shortenAddress } from "@/utils/formatter";

export default function Ticker() {
  const [data, setData] = useState<TickerData>({
    ticker: "",
    priceData: [],
    tweets: [],
    tweetsRelation: [],
    addressInfo: []
  });
  const [isError, setIsError] = useState<Error>()
  const { ticker } = useLoaderData<TickerData>();
  const [loading, setLoading] = useState(false);
  const { address } = useWallet()
  const { token_level } = userUser()

  const { ca } = useParams()
  const { updateTrade, trade, updateAddress } = useTrade()

  useWebSocket(ca || "", (data) => updateTrade(data), (data) => updateAddress(data))
  

  useEffect(() => {
    const getfetchData = async () => {
      if (ticker && token_level && ca) {

        setLoading(true)
        try {
          const [priceRes, tweetsRes, tweetsRelation, addressInfo] = await Promise.all([
            token_level === TokenLevel.ADVANCED ? getHistoryAdvanced(ticker) : getHistoryBasic(ticker),
            token_level === TokenLevel.ADVANCED ? getTweetAdvanced(ticker) : getTweetBasic(ticker),
            getRelation(ticker),
            getAddressInfo(ca)
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
            tweetsRelation: tweetsRelation.tweets,
            addressInfo: addressInfo.transactions.map(item => ({
              ...item,
              utc_time: item.transaction_time
            })).slice(0, 1000)
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

  const getColor = useMemo(() => {
    if (!trade.address) return ""
    return trade.address?.token_change > 0 ? "green" : "red"
  }, [trade.address])

  const getTweet = useMemo(() => {
    console.log(trade.tweet,'trade.tweet')
    
    if (!trade.tweet) return ""
    return trade.tweet?.user + "  " + trade.tweet?.created_at
  }, [trade.tweet])
  return (
    <>
      <style>
        {`
          @keyframes slideLeft {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-slide {
            animation: slideLeft 15s linear infinite;
            white-space: nowrap;
          }
          .text-container {
            position: relative;
            overflow: hidden;
            width: 100%;
          }
        `}
      </style>
      <Flex flexDirection={'column'} w={"full"} maxW={"1400px"} mx={"auto"}>
        <Flex justifyContent={"space-between"} py={5} alignItems={"center"}>
          <Heading size="2xl" mb={8} textAlign="left" >
            ${ticker?.toUpperCase()}
          </Heading>
          <Flex 
            flexDirection="column" 
            mb={8} 
            w="400px"
            bg="rgba(0, 0, 0, 0.05)"
            borderRadius="lg"
            p={3}
            position="relative"
            overflow="hidden"
          >
            <Flex 
              direction="column" 
              gap={2}
            >
              <Flex
                align="center"
                bg="white"
                p={2}
                borderRadius="md"
                boxShadow="sm"
                className="slide-in"
              >
                <Icon as={FaTwitter} color="blue.400" boxSize={4} mr={2} />
                <Box flex={1} className="text-container">
                  {/* <Text fontSize="xs" color="gray.500" mb={0.5}>
                    最新推文
                  </Text> */}
                  <Text color="green" fontSize="sm" fontWeight="medium" className="animate-slide">
                    {getTweet}
                  </Text>
                </Box>
              </Flex>

              <Flex
                align="center"
                bg="white"
                p={2}
                borderRadius="md"
                boxShadow="sm"
                className="slide-in"
              >
                <Icon as={FaCoins} color="green.400" boxSize={4} mr={2} />
                <Box flex={1} className="text-container">
                  {/* <Text fontSize="xs" color="gray.500" mb={0.5}>
                    代币动态
                  </Text> */}
                  <Text style={{color:getColor}} fontSize="sm" fontWeight="medium" className="animate-slide">
                    {shortenAddress(trade.address?.acc_holder || "") +"  "+ (trade.address?.token_change || 0 > 0 ? "buy" : "sell") +  ` ${trade.address?.token_change}`}
                  </Text>
                </Box>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        {/* <Container maxW="container.lg" py={8}>
          <Heading size="2xl" mb={8} textAlign="left">
            ${ticker?.toUpperCase()}
          </Heading>
        </Container> */}
        {/* {loading ? <Loading /> :
            <>
              <Suspense
                fallback={
                  <Flex align="center" justify="center" h="600px">
                    <Spinner />
                  </Flex>
                }
              >
                <TokenEChart initialData={data} />
              </Suspense>
            </>
          } */}
        <Flex display={"flex"} justifyContent={"space-between"} w={"full"}>
          {loading ? <Loading /> :
            <>
              <TokenEChart initialData={data} />
              <Box
                position="sticky"
                top="300px"
                alignSelf="flex-start"
                width="7%"
                height="300px"
                marginLeft={"10px"}
              >
                <HeatMap data={data.priceData} currentValue={70} />
              </Box>
            </>
          }
        </Flex>
        {/* <Box
          position="fixed"
          bottom="10px"
          right="15px"
          // width={{ base: "80px", sm: "100px", md: "120px" }}
          // height={{ base: "300px", sm: "120px", md: "140px" }}
          width={"110px"}
          pointerEvents="auto"
          height={"300px"}
          // bg={"#fff"}
          zIndex={1}
        >
          <HeatMap data={data.priceData} currentValue={70} />
        </Box> */}
      </Flex>
    </>
  );
}

