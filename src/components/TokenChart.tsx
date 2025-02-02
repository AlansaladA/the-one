import { useState, useMemo, useEffect, memo, Fragment } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceDot,
  Brush,
} from "recharts";
import {
  Box,
  Flex,
  Text,
  Spinner,
  // Button,
  VStack,
  HStack
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { useParams, useNavigate } from 'react-router'
import { Tweet, PriceHistory } from "@/utils/types";
import { Avatar, AvatarGroup } from "@/components/ui/avatar"
import Loading from "./loading";
import { Button } from "@/components/ui/button"
import { FaTwitter } from "react-icons/fa";
import Relation from "./relation"
import { Link } from "react-router";
import Follow from "./follow";
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box bg="gray.700" p={3} rounded="md" shadow="md">
        <Text color="gray.300" mb={2}>
          {new Date(label).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: false,
          })}
        </Text>
        <Flex align="center">
          <Text color="gray.400">Price:</Text>
          <Text fontWeight="bold" ml={1} color="white">
            ${Number(payload[0].value).toFixed(4)}
          </Text>
        </Flex>
      </Box>
    );
  }
  return null;
};

interface CustomDotProps {
  cx: number;
  cy: number;
  payload?: any;
  tweets: Tweet[];
  price: number;
  chartData: Array<{
    time: Date;
    price: number;
  }>;
}

const CustomDot = ({
  cx,
  cy,
  payload,
  tweets,
  price,
  chartData,
}: CustomDotProps) => {
  const navigate = useNavigate()
  if (!tweets?.length) return null;


  const calculateImpact = (tweet: Tweet, currentPrice: number) => {
    // Find highest price after the tweet
    const tweetTime = new Date(tweet.created_at).getTime();
    const laterPrices = chartData.filter(
      (d: any) => new Date(d.time).getTime() > tweetTime
    );

    if (laterPrices.length === 0) return null;

    const highestPrice = Math.max(...laterPrices.map((d: any) => d.price));
    const priceChange = ((highestPrice - currentPrice) / currentPrice) * 100;

    return {
      highestPrice,
      priceChange,
    };
  };

  return (
    <foreignObject
      x={cx - 12}
      y={cy - 12}
      width={24}
      height={24}
      style={{ overflow: "visible" }}
    >
      <Tooltip closeOnScroll={false} interactive contentProps={
        {
          p: 0, bg: 'transparent', maxWidth: 'none', // 让宽度自动适配内容
          width: '500px'
        }
      }
        content={
          <Box overflowY={"auto"} maxHeight={"300px"} p={4} display={"flex"} flexDirection={"column"} gap={4} bg="#2D2D4FF2" borderRadius="lg" color="gray.300" >
            {tweets.map((tweet: Tweet, i) => {
              const impact = calculateImpact(tweet, price);
              return (
                <Box
                  key={i}
                  borderBottomWidth={i !== tweets.length - 1 ? "1px" : "none"}
                  borderColor="#2D2D4F"
                // borderBottomWidth="1px"
                >
                  <Flex justify="space-between" align="center" gap={3}>
                    <Flex align="center" gap={3}>
                      <Avatar
                        src={tweet.profile_image_url}
                        size="sm"
                        cursor="pointer"
                        _hover={{ opacity: 0.8 }}
                      />
                      <Flex alignItems={"flex-start"} flexDirection={"column"}>
                        <Text fontSize={"sm"} fontWeight="bold" color="white" _hover={{ textDecor: "underline" }}>
                          {tweet.user}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          @{tweet.screen_name}·{tweet.followers_count.toLocaleString()}
                        </Text>
                        <Text color="gray.400">followers</Text>
                      </Flex>
                    </Flex>
                    <Flex gap={2}>
                      <Button onClick={() => { navigate(`/detail/${tweet.screen_name}`) }} borderRadius={"full"} size="sm" bg="gray.500" _hover={{ bg: "gray.700" }} color="white">
                        <Text fontWeight={"bold"}>Profile</Text>
                      </Button>
                      <Button
                        borderRadius={"full"}
                        size="sm"
                        // leftIcon={<FaTwitter />}
                        bg="blue.500"
                        color="white"
                        onClick={() => window.open(`https://twitter.com/intent/follow?screen_name=${tweet.screen_name}`, '_blank')}
                      >
                        <FaTwitter className="text-xs" />
                        <Text fontWeight={"bold"}>Follow</Text>
                      </Button>
                    </Flex>
                  </Flex>

                  <Box mt={2} spaceY={1}>
                    <Flex justify="space-between" fontSize="sm">
                      <Text color="gray.400">Price at Post</Text>
                      <Text color={"white"} fontFamily="monospace" fontWeight={"bold"}>${price.toFixed(4)}</Text>
                    </Flex>
                    {impact && (
                      <>
                        <Flex justify="space-between" fontSize="sm">
                          <Text color="gray.400">Highest After</Text>
                          <Text color={"white"} fontWeight={"bold"} fontFamily="monospace">${impact.highestPrice.toFixed(4)}</Text>
                        </Flex>
                        <Flex justify="space-between" fontSize="sm">
                          <Text color="gray.400">Return After Tweet</Text>
                          <Text
                            fontWeight={"bold"}
                            fontFamily="monospace"
                            color={impact.priceChange >= 0 ? "green.500" : "red.500"}
                          >
                            {impact.priceChange >= 0 ? "+" : ""}
                            {impact.priceChange.toFixed(2)}%
                          </Text>
                        </Flex>
                      </>
                    )}
                  </Box>

                  <Text mt={2} fontSize="sm" color="white">
                    {tweet.text}
                  </Text>
                </Box>
              );
            })}
          </Box>
        }
      >
        <Box position={"relative"} display={"flex"} alignItems={"center"} cursor={"pointer"}>
          {tweets.length > 1 ? (
            <AvatarGroup stacking="last-on-top" borderless>
              {tweets.slice(0, 7).map((tweet: Tweet, i: number) => (
                <Link
                  style={{ color: "inherit" }}
                  to={`/detail/${tweet.screen_name}`}
                  key={i}
                >
                  <Avatar w="15px" h="15px" src={tweet.profile_image_url}></Avatar>
                </Link>
              ))}
              {tweets.length > 7 && (
                // <Avatar
                //   fallback={`+${tweets.length - 7}`}
                //   w="25px"
                //   h="25px"
                //   fontSize={"xs"}
                // />
                <Flex
                  w="25px"
                  h="25px"
                  borderRadius={"full"}
                  bgColor={"#3F3F46"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Text fontSize="xs">{"+" + (tweets.length - 7)}</Text>
                </Flex>
              )}
            </AvatarGroup>
          ) : (
            <Link style={{ color: "inherit" }} to={`/detail/${tweets[0].screen_name}`}>
              <Avatar w="15px" h="15px" src={tweets[0].profile_image_url}></Avatar>
            </Link>
          )
          }
        </Box>
      </Tooltip >
    </foreignObject >
  );
};
const MemoCustomDot = memo(CustomDot)


const TokenChart = ({
  initialData,
}: {
  initialData: { priceHistory: PriceHistory[]; tweets: Tweet[], tweetsRelation: any };
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [followerRange, setFollowerRange] = useState<string[]>([]);

  const processedChartData = useMemo(() => {
    return initialData.priceHistory.map((item) => ({
      time: new Date(item.download_time),
      price: parseFloat(item.close),
    }));
  }, [initialData.priceHistory]);

  const getFollowerRange = (followersCount: number): string => {
    if (followersCount < 5000) return "0-5k";
    if (followersCount < 10000) return "5k-10k";
    if (followersCount < 50000) return "10k-50k";
    return "50k+";
  };

  const tweetMarkers = useMemo(() => {
    const markers: { time: Date; price: number; tweets: Tweet[] }[] = [];
    const filteredTweets =
      followerRange.length > 0
        ? initialData.tweets.filter((tweet) =>
          followerRange.includes(getFollowerRange(tweet.followers_count))
        )
        : initialData.tweets;

    filteredTweets.forEach((tweet) => {
      const tweetTime = new Date(tweet.created_at);
      const closestPricePoint = processedChartData.find((pricePoint) => {
        const timeDiff = Math.abs(
          pricePoint.time.getTime() - tweetTime.getTime()
        );
        return timeDiff <= 3600000;
      });

      if (!closestPricePoint) return;

      const existingMarker = markers.find(
        (m) => m.time.getTime() === closestPricePoint.time.getTime()
      );

      if (existingMarker) {
        existingMarker.tweets.push(tweet);
      } else {
        markers.push({
          time: closestPricePoint.time,
          price: closestPricePoint.price,
          tweets: [tweet],
        });
      }
    });
    // console.log(markers, 'markers');

    return markers;
  }, [initialData.tweets, processedChartData, followerRange]);


  useEffect(() => {
    if (processedChartData.length > 0) {
      setIsLoading(false);
    }
  }, [processedChartData]);

  const formatTime = (date: Date) => {
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
  }

  const [range, setRange] = useState<[number, number]>([0, initialData.priceHistory.length - 1])

  useEffect(() => {
    if (tweetMarkers.length > 0) {
      const firstTweetIndex = processedChartData.findIndex(
        (data) => tweetMarkers.some((marker) => marker.time.getTime() === data.time.getTime())
      );
      const lastTweetIndex = processedChartData.findLastIndex(
        (data) => tweetMarkers.some((marker) => marker.time.getTime() === data.time.getTime())
      );

      if (firstTweetIndex !== -1 && lastTweetIndex !== -1) {
        setRange([firstTweetIndex, lastTweetIndex + 1]);
      }
    }
  }, [tweetMarkers, processedChartData]);
  const [brushRange, setBrushRange] = useState<[number, number]>([0, 10]);

  useEffect(() => {
    setBrushRange(range); // 确保 Brush 状态和 range 同步
  }, [range]);

  const fillFun = () =>{
    setRange([0, initialData.priceHistory.length - 1])
  }

  return (
    <Box mb={8}>
      <Flex gap={4} mb={4} justifyContent={"space-between"}>
        <VStack align="start">
          <Text fontSize="sm" color="gray.400">
            Filter by Followers
          </Text>
          <HStack>
            {(["0-5k", "5k-10k", "10k-50k", "50k+"] as const).map((range) => (
              <Button
                key={range}
                size="sm"
                variant="outline"
                onClick={() => {
                  setFollowerRange((prev) =>
                    prev.includes(range)
                      ? prev.filter((r) => r !== range)
                      : [...prev, range]
                  );
                }}
                // colorScheme={followerRange.includes(range) ? "blue" : "gray"}
                bg={followerRange.includes(range) ? "blue.500" : "gray.800"}
              >
                {range}
              </Button>
            ))}
          </HStack>
        </VStack>
        <Button onClick={fillFun}>filled</Button>
      </Flex>
      <Box position="relative" height="600px">
        {isLoading ? (
          <Loading></Loading>
        ) : <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedChartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickFormatter={formatTime}
              stroke="#666"
              tick={{ fill: "#666" }}
            />
            <YAxis stroke="#666" tick={{ fill: "#666" }} />
            <RechartsTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
            {tweetMarkers.map((marker, index) => (
              <ReferenceDot
                key={index}
                x={marker.time.getTime()}
                y={marker.price}
                r={0}
                shape={(props) => (
                  <MemoCustomDot
                    {...props}
                    tweets={marker.tweets}
                    price={marker.price}
                    chartData={processedChartData}
                  />
                )}
              />
            ))}
            <Brush
              dataKey="time"
              height={30}
              stroke="#8884d8"
              fill="#1f1f1f"
              tickFormatter={formatTime}
              startIndex={brushRange[0]}
              endIndex={brushRange[1]}
              onChange={(props) => {
                if (props.startIndex !== undefined && props.endIndex !== undefined) {
                  // setBrushRange([props.startIndex, props.endIndex + 1]); // 先更新 Brush
                  // setRange([props.startIndex, props.endIndex])
                  setTimeout(() => setRange([props.startIndex || 0, props.endIndex || 1]), 100); // 延迟同步 range
                }
              }}
            >
              <AreaChart>
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </Brush>
          </AreaChart>
        </ResponsiveContainer>
        }
      </Box>

      <Follow
        range={range}
        priceHistory={initialData.priceHistory} tweets={initialData.tweets} tweetsRelation={initialData.tweetsRelation}></Follow>
    </Box>
  );
};

export default TokenChart;