import {
  Box,
  Flex,
  Text,
  Spinner,
  // Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useMemo, useState, useEffect, memo } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { useParams, useNavigate } from 'react-router'
import { Avatar, AvatarGroup } from "@/components/ui/avatar"
import Loading from "./loading";
import { Button } from "@/components/ui/button"
import { FaTwitter } from "react-icons/fa";
import { Link } from "react-router";
import { Tweet, PriceHistory } from "@/utils/types";
import { Slider } from "@/components/ui/slider"

export default function Follow({ priceHistory, tweets, tweetsRelation, range }: {
  priceHistory: PriceHistory[]
  tweets: Tweet[]
  tweetsRelation: any
  range: [number, number]
}) {
  const [selectRange, setSelectRange] = useState<number[]>([0, 100]);
  const sortedTweetMarkers = useMemo(() => {
    if (!tweetsRelation.length) return [];
    const relationData = tweetsRelation[0]?.data || {};
    const position = tweetsRelation[0]?.position ? JSON.parse(tweetsRelation[0].position) : {};
  
    return tweets.map(tweet => {
      const tweetId = tweet.tweet_id.toString();
      return {
        ...tweet,
        time: new Date(tweet.created_at),
        relation: relationData[tweetId]?.filter(id => id !== tweetId) || [],
        value: position[tweetId] || 0
      };
    }).sort((a, b) => a.time.getTime() - b.time.getTime())
  }, [tweetsRelation]);

  console.log(range);


  // 计算时间和价格的范围
  // const timeRange = useMemo(() => ({ min: range[0], max: range[1] }), [range])
  const timeRange = useMemo(() => {
    if (priceHistory.length === 0) return { min: 0, max: 1 };
    // 提取时间戳数组
    const times = priceHistory.map(m => new Date(m.download_time).getTime()).sort((a, b) => a - b);
    const totalCount = times.length;
    // 计算索引位置
    const startIndex = Math.floor((selectRange[0] / 100) * (totalCount - 1));
    const endIndex = Math.floor((selectRange[1] / 100) * (totalCount - 1));
    console.log(startIndex, endIndex, range);

    return {
      min: times[range[0]], // 选取范围的起始时间
      max: times[range[1]]    // 选取范围的结束时间
    };
  }, [priceHistory, selectRange, range]);


  const priceRange = useMemo(() => {
    if (sortedTweetMarkers.length === 0) return { min: 0, max: 1 };
    const value = sortedTweetMarkers.map(m => m.value);
    return {
      min: Math.min(...value),
      max: Math.max(...value)
    };
  }, [sortedTweetMarkers]);

  return <Box w={"100%"} h="620px"  position="relative" mt={10} pl={14} py={2}>
    {/* <Slider width="100%" defaultValue={[0, 100]} onValueChange={(val) => setSelectRange(val.value)} /> */}
    <Box
      w="100%"
      h="100%"
      position="relative"
      mt={6}
      overflow={"hidden"} 
      // py={4}
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
    </Box>
  </Box>
}


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

        let x1 = ((marker1.time.getTime() - timeRange.min ) / (timeRange.max - timeRange.min)) * 99;
        let y1 = ((marker1.value - priceRange.min) / (priceRange.max - priceRange.min)) * 98;
        let x2 = ((marker2.time.getTime() - timeRange.min ) / (timeRange.max - timeRange.min)) * 99;
        let y2 = ((marker2.value - priceRange.min) / (priceRange.max - priceRange.min)) * 98;
        if(y1<5) y1 +=1
        if(y2<5) y2 +=1
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
      {lines.length && lines.map(line => (
        <line
          key={line?.key}
          x1={line?.x1}
          y1={line?.y1}
          x2={line?.x2}
          y2={line?.y2}
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
      let xPos = ((marker.time.getTime() - timeRange.min) / (timeRange.max - timeRange.min)) * 99;
      let yPos = ((marker.value - priceRange.min) / (priceRange.max - priceRange.min)) * 98;
      if(yPos<5) yPos +=1
      // **防止超出边界**
      // if (yPos > 95) yPos = 95; // 贴近底部的上移
      // if (yPos < 5)   yPos = 2;   // 贴近顶部的下移

      return { key: marker.tweet_id, xPos, yPos, marker };
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
          style={{ willChange: 'transform' }} 

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

  return (
    <foreignObject
      x={cx - 12}
      y={cy - 12}
      width={40} // 增大外层
      height={40} // 增大外层
      style={{ overflow: "visible", padding: "4px" }} // 增加 padding
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