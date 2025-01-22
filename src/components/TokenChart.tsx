"use client";

import { useState, useMemo, useEffect } from "react";
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
  Button,
  VStack,
  HStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
// import { FaTwitter } from "react-icons/fa";
import { Tweet, PriceHistory } from "@/utils/types";
import { Avatar } from "@/components/ui/avatar"

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
      <Tooltip
        content={
          <div className="bg-gray-900 rounded-lg shadow-lg max-w-sm">
            {tweets.map((tweet: Tweet, i) => {
              const impact = calculateImpact(tweet, price);
              return (
                <div
                  key={i}
                  className={`p-3 ${i !== tweets.length - 1 ? "border-b border-gray-800" : ""
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* <NextLink
                        href={`/detail/${tweet.screen_name}`}
                        target="_blank"
                      >
                        <Avatar
                          src={tweet.profile_image_url}
                          className="w-8 h-8 cursor-pointer hover:opacity-80"
                        />
                      </NextLink> */}
                      <div>
                        {/* <NextLink
                          href={`https://twitter.com/${tweet.screen_name}`}
                          target="_blank"
                          className="hover:underline"
                        >
                          <div className="font-bold text-white">
                            {tweet.user}
                          </div>
                          <div className="text-sm text-gray-400">
                            @{tweet.screen_name} ·{" "}
                            {tweet.followers_count.toLocaleString()} followers
                          </div>
                        </NextLink> */}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* <NextLink
                        href={`/detail/${tweet.screen_name}`}
                        className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
                      >
                        Profile
                      </NextLink>
                      <NextLink
                        href={`https://twitter.com/intent/follow?screen_name=${tweet.screen_name}`}
                        target="_blank"
                        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors flex items-center gap-1"
                      >
                        <FaTwitter className="text-xs" />
                        Follow
                      </NextLink> */}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Price at Post</span>
                      <span className="font-mono">${price.toFixed(4)}</span>
                    </div>
                    {impact && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Highest After</span>
                          <span className="font-mono">
                            ${impact.highestPrice.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            Return After Tweet
                          </span>
                          <span
                            className={`font-mono font-bold ${impact.priceChange >= 0
                                ? "text-green-500"
                                : "text-red-500"
                              }`}
                          >
                            {impact.priceChange >= 0 ? "+" : ""}
                            {impact.priceChange.toFixed(2)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-gray-300">{tweet.text}</p>
                </div>
              );
            })}
          </div>
        }
      >
        <div className="relative flex items-center scale-75">
          {tweets.length > 1 ? (
              tweets.map((tweet: Tweet, i: number) => {
                return <Flex key={i}>
                     <Avatar w="8px" h="8px" src={tweet.profile_image_url}></Avatar>
                </Flex>
              })
            // </AvatarGroup>
          ) : (
             <Flex></Flex>
          )
        }
        </div>
      </Tooltip>
    </foreignObject>
  );
};



const TokenChart = ({
  initialData,
}: {
  initialData: { priceHistory: PriceHistory[]; tweets: Tweet[] };
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
    console.log(markers,'markers');
    
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

  return (
    <Box mb={8}>
      <Flex gap={4} mb={4}>
        <VStack align="start">
          <Text fontSize="sm" color="gray.400">
            Filter by Followers
          </Text>
          <HStack>
            {(["0-5k", "5k-10k", "10k-50k", "50k+"] as const).map((range) => (
              <Button
                key={range}
                size="sm"
                onClick={() => {
                  setFollowerRange((prev) =>
                    prev.includes(range)
                      ? prev.filter((r) => r !== range)
                      : [...prev, range]
                  );
                }}
                colorScheme={followerRange.includes(range) ? "blue" : "gray"}
                variant={followerRange.includes(range) ? "solid" : "outline"}
              >
                {range}
              </Button>
            ))}
          </HStack>
        </VStack>
      </Flex>

      <Box position="relative" height="600px">
        {isLoading && (
          <Flex
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            align="center"
            justify="center"
            bg="gray.800"
            opacity={0.8}
          >
            <Spinner size="lg" />
          </Flex>
        )}

        <ResponsiveContainer width="100%" height="100%">
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
                  <CustomDot
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
      </Box>
    </Box>
  );
};

export default TokenChart;