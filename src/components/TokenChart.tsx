import { useState, useMemo, useEffect, memo,Fragment } from "react";
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
// import { FaTwitter } from "react-icons/fa";
import { Tweet, PriceHistory } from "@/utils/types";
import { Avatar, AvatarGroup } from "@/components/ui/avatar"
import Loading from "./loading";
import { Button } from "@/components/ui/button"
import { FaTwitter } from "react-icons/fa";
import Relation from "./relation"
import { Link } from "react-router";
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








  const sortedTweetMarkers = useMemo(() => {
    if (!initialData.tweetsRelation.length) return []
    const position = JSON.parse(initialData.tweetsRelation[0].position)
    const data = initialData.tweetsRelation[0].data

    // 找关联数据
    const tweetsWithRelation = initialData.tweets.map(tweet => {
      const tweetId = tweet.tweet_id.toString();
      const relationWithoutSelf = data[tweetId] ?
        data[tweetId].filter(id => id !== tweetId) :
        [];

      return {
        ...tweet,
        time: new Date(tweet.created_at),
        relation: relationWithoutSelf
      }
    }).sort((a, b) => a.time.getTime() - b.time.getTime());

    const list2 = tweetsWithRelation.filter(tweet =>
      position.hasOwnProperty(tweet.tweet_id)
    ).map(tweet => ({
      ...tweet,
      value: position[tweet.tweet_id]
    }));

    console.log(list2, 'list2');

    return list2.slice(4)
  }, [initialData.tweets, initialData.tweetsRelation])


  // 计算时间和价格的范围
  const timeRange = useMemo(() => {
    if (sortedTweetMarkers.length === 0) return { min: 0, max: 1 };
    const times = sortedTweetMarkers.map(m => m.time.getTime());
    return {
      min: Math.min(...times),
      max: Math.max(...times)
    };
  }, [sortedTweetMarkers]);

  const priceRange = useMemo(() => {
    if (sortedTweetMarkers.length === 0) return { min: 0, max: 1 };
    const value = sortedTweetMarkers.map(m => m.value);
    return {
      min: Math.min(...value),
      max: Math.max(...value)
    };
  }, [sortedTweetMarkers]);

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

      {/* <Relation relationData={relationData}></Relation> */}


      <Box w={"100%"} h="600px" p={4} position="relative" mt={7}>
        <Box
          w="100%"
          h="100%"
          position="relative"
        >
          <RelationLines
            sortedTweetMarkers={sortedTweetMarkers}
            timeRange={timeRange}
            priceRange={priceRange}
          />
          <MarkerPoints
            sortedTweetMarkers={sortedTweetMarkers}
            timeRange={timeRange}
            priceRange={priceRange}
          />
          {/* <svg
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none', // 确保线不会影响点的交互
            }}
          >
            {sortedTweetMarkers.map((marker1, i) => {
              return sortedTweetMarkers.map((marker2, j) => {
                // 跳过自己和已经处理过的连接
                if (i >= j) return null;

                // 检查是否存在关系连接
                const hasRelation = marker1.relation?.includes(marker2.tweet_id) ||
                  marker2.relation?.includes(marker1.tweet_id);

                if (!hasRelation) return null;

                const x1 = ((marker1.time.getTime() - timeRange.min) / (timeRange.max - timeRange.min)) * 100;
                const y1 = ((marker1.value - priceRange.min) / (priceRange.max - priceRange.min)) * 100;

                const x2 = ((marker2.time.getTime() - timeRange.min) / (timeRange.max - timeRange.min)) * 100;
                const y2 = ((marker2.value - priceRange.min) / (priceRange.max - priceRange.min)) * 100;

                return (
                  <line
                    key={`line-${i}-${j}`}
                    x1={`${x1}%`}
                    y1={`${100 - y1}%`}
                    x2={`${x2}%`}
                    y2={`${100 - y2}%`}
                    stroke="rgba(136, 132, 216, 0.5)"
                    strokeWidth="2"
                    opacity={0.5}
                  />
                );
              });
            })}
          </svg>

          {sortedTweetMarkers.map((marker, index) => {
            const xPos = ((marker.time.getTime() - timeRange.min) / (timeRange.max - timeRange.min)) * 100;
            const yPos = ((marker.value - priceRange.min) / (priceRange.max - priceRange.min)) * 100;
            return (
              <Box
                key={index}
                position="absolute"
                left={`${xPos}%`}
                bottom={`${yPos}%`}
                transform="translate(-50%, 50%)"
                zIndex={1} // 确保点在线的上面
              >
                <MemoCustomDotRelation
                  cx={12}
                  cy={12}
                  tweets={marker}
                  // price={marker.price}
                  // chartData={processedChartData}
                />
              </Box>
            );
          })} */}
        </Box>
      </Box>
    </Box>
  );
};

export default TokenChart;


interface RelationProps {
  sortedTweetMarkers: any[];
  timeRange: { min: number; max: number };
  priceRange: { min: number; max: number };
}

const RelationLines = memo(({ sortedTweetMarkers, timeRange, priceRange }: RelationProps) => {
  // 使用 useMemo 缓存线条数据
  const lines = useMemo(() => {
    return sortedTweetMarkers.map((marker1, i) => (
      sortedTweetMarkers.slice(i + 1).map((marker2, j) => {
        const hasRelation = marker1.relation?.includes(marker2.tweet_id) ||
          marker2.relation?.includes(marker1.tweet_id);

        if (!hasRelation) return null;

        const x1 = ((marker1.time.getTime() - timeRange.min) / (timeRange.max - timeRange.min)) * 100;
        const y1 = ((marker1.value - priceRange.min) / (priceRange.max - priceRange.min)) * 100;
        const x2 = ((marker2.time.getTime() - timeRange.min) / (timeRange.max - timeRange.min)) * 100;
        const y2 = ((marker2.value - priceRange.min) / (priceRange.max - priceRange.min)) * 100;

        return {
          key: `line-${i}-${j}`,
          x1: `${x1}%`,
          y1: `${100 - y1}%`,
          x2: `${x2}%`,
          y2: `${100 - y2}%`
        };
      }).filter(Boolean)
    )).flat();
  }, [sortedTweetMarkers, timeRange, priceRange]);

  return (
    <svg
      width="100%"
      height="100%"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    >
      {lines.map(line => (
        <line
          key={line.key}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="rgba(136, 132, 216, 0.5)"
          strokeWidth="2"
          opacity={0.5}
        />
      ))}
    </svg>
  );
});

// 2. 将点位渲染抽离为单独的组件
const MarkerPoints = memo(({ sortedTweetMarkers, timeRange, priceRange }: RelationProps) => {
  // 使用 useMemo 缓存点位数据
  const points = useMemo(() => {
    return sortedTweetMarkers.map((marker) => {
      const xPos = ((marker.time.getTime() - timeRange.min) / (timeRange.max - timeRange.min)) * 100;
      const yPos = ((marker.value - priceRange.min) / (priceRange.max - priceRange.min)) * 100;
      
      return {
        key: marker.tweet_id,
        xPos,
        yPos,
        marker
      };
    });
  }, [sortedTweetMarkers, timeRange, priceRange]);

  return (
    <>
      {points.map(point => (
        <Box
          key={point.key}
          position="absolute"
          left={`${point.xPos}%`}
          bottom={`${point.yPos}%`}
          transform="translate(-50%, 50%)"
          zIndex={1}
          style={{ willChange: 'transform' }} // 优化渲染性能
        >
          <MemoCustomDotRelation
            cx={12}
            cy={12}
            tweets={point.marker}
          />
        </Box>
      ))}
    </>
  );
});





const CustomDotRelation = ({
  cx,
  cy,
  // payload,
  tweets,
  // price,
  // chartData,
}) => {
  const navigate = useNavigate()
  if (!tweets) return null;

  // const calculateImpact = (tweet: Tweet, currentPrice: number) => {
  //   // Find highest price after the tweet
  //   const tweetTime = new Date(tweet.created_at).getTime();
  //   const laterPrices = chartData.filter(
  //     (d: any) => new Date(d.time).getTime() > tweetTime
  //   );

  //   if (laterPrices.length === 0) return null;

  //   const highestPrice = Math.max(...laterPrices.map((d: any) => d.price));
  //   const priceChange = ((highestPrice - currentPrice) / currentPrice) * 100;

  //   return {
  //     highestPrice,
  //     priceChange,
  //   };
  // };

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

            <Box
              // key={i}
              // borderBottomWidth={i !== tweets.length - 1 ? "1px" : "none"}
              borderColor="#2D2D4F"
            // borderBottomWidth="1px"
            >
              <Flex justify="space-between" align="center" gap={3}>
                <Flex align="center" gap={3}>
                  <Avatar
                    src={tweets.profile_image_url}
                    size="sm"
                    cursor="pointer"
                    _hover={{ opacity: 0.8 }}
                  />
                  <Flex alignItems={"flex-start"} flexDirection={"column"}>
                    <Text fontSize={"sm"} fontWeight="bold" color="white" _hover={{ textDecor: "underline" }}>
                      {tweets.user}
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      @{tweets.screen_name}·{tweets.followers_count.toLocaleString()}
                    </Text>
                    <Text color="gray.400">followers</Text>
                  </Flex>
                </Flex>
                <Flex gap={2}>
                  <Button onClick={() => { navigate(`/detail/${tweets.screen_name}`) }} borderRadius={"full"} size="sm" bg="gray.500" _hover={{ bg: "gray.700" }} color="white">
                    <Text fontWeight={"bold"}>Profile</Text>
                  </Button>
                  <Button
                    borderRadius={"full"}
                    size="sm"
                    bg="blue.500"
                    color="white"
                    onClick={() => window.open(`https://twitter.com/intent/follow?screen_name=${tweets.screen_name}`, '_blank')}
                  >
                    <FaTwitter className="text-xs" />
                    <Text fontWeight={"bold"}>Follow</Text>
                  </Button>
                </Flex>
              </Flex>

              {/* <Box mt={2} spaceY={1}>
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
                  </Box> */}

              <Text mt={2} fontSize="sm" color="white">
                {tweets.text}
              </Text>
            </Box>
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
            <Link style={{ color: "inherit" }} to={`/detail/${tweets.screen_name}`}>
              <Avatar w="15px" h="15px" src={tweets.profile_image_url}></Avatar>
            </Link>
          )
          }
        </Box>
      </Tooltip >
    </foreignObject >
  );
};
const MemoCustomDotRelation = memo(CustomDotRelation)