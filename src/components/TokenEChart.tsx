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
import { FiSearch } from "react-icons/fi";
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
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import RelationChart from "./relationEchart";
import _ from "lodash";

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

const CustomDot = memo(({
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
}, (prevProps, nextProps) => {
  // 自定义比较函数，只在必要时重新渲染
  return prevProps.cx === nextProps.cx &&
    prevProps.cy === nextProps.cy &&
    prevProps.price === nextProps.price;
});



export default function TokenEChart({
  initialData,
}: {
  initialData: { priceHistory: PriceHistory[]; tweets: Tweet[], tweetsRelation: any };
}) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true);
  const [followerRange, setFollowerRange] = useState<string[]>(["10k-50k", "50k+"]);

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
  // const [brushRange, setBrushRange] = useState<[number, number]>([0, 10]);

  // useEffect(() => {
  //   setBrushRange(range); // 确保 Brush 状态和 range 同步
  // }, [range]);

  const fillFun = () => {
    setRange([0, initialData.priceHistory.length - 1])
  }

  // 1. 添加时间窗口过滤，只显示当前可见区域的 markers
  const visibleTweetMarkers = useMemo(() => {
    const startTime = processedChartData[range[0]]?.time.getTime();
    const endTime = processedChartData[range[1]]?.time.getTime();

    return tweetMarkers.filter(marker => {
      const markerTime = marker.time.getTime();
      return markerTime >= startTime && markerTime <= endTime;
    });

  }, [tweetMarkers, range, processedChartData]);

  const calculateImpact = (tweet: Tweet, currentPrice: number) => {
    const tweetTime = new Date(tweet.created_at).getTime();
    const laterPrices = processedChartData.filter(
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

  const getChartOption = () => {
    return {
      backgroundColor: '#121212', // 深色背景
      tooltip: {
        trigger: 'item',
        enterable: true,
        confine: true,
        position: function (point) {
          // 将tooltip位置调整到更靠近鼠标的位置
          return [point[0] - 10, point[1] + 10]; // 向左偏移10像素,向下偏移10像素
        },
        formatter: function (params: any) {
          const marker = params.data[2];
          if (!marker) return '';

          const tooltipId = `tooltip-${Date.now()}`;
          setTimeout(() => {
            marker.tweets.forEach((tweet: Tweet, index: number) => {
              const profileBtn = document.querySelector(`#${tooltipId}-profile-${index}`);
              const followBtn = document.querySelector(`#${tooltipId}-follow-${index}`);

              if (profileBtn) {
                profileBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  navigate(`/detail/${tweet.screen_name}`);
                });
              }

              if (followBtn) {
                followBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  window.open(`https://twitter.com/intent/follow?screen_name=${tweet.screen_name}`, '_blank');
                });
              }
            });
          }, 0);

          return `
            <div id="${tooltipId}" style="padding: 16px; max-width: 500px;overflow-y: auto; max-height: 300px;">
              ${marker.tweets.map((tweet: Tweet, index: number) => {
            const impact = calculateImpact(tweet, marker.price);
            return `
                  <div style="
                    padding-bottom: 16px;
                    margin-bottom: 16px;
                    border-bottom: ${index !== marker.tweets.length - 1 ? '1px solid #2D2D4F' : 'none'};
                  ">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                      <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${tweet.profile_image_url}" 
                             style="width: 32px; height: 32px; border-radius: 50%;"/>
                        <div>
                          <div style="color: white; font-weight: bold; font-size: 14px;">
                            ${tweet.user}
                          </div>
                          <div style="color: #A0AEC0; font-size: 14px;">
                            @${tweet.screen_name}·${tweet.followers_count.toLocaleString()}
                          </div>
                          <div style="color: #A0AEC0; font-size: 14px;">
                            followers
                          </div>
                        </div>
                      </div>
                      <div style="display: flex; gap: 8px;">
                        <button id="${tooltipId}-profile-${index}" style="
                          background: #718096;
                          border: none;
                          color: white;
                          padding: 6px 12px;
                          border-radius: 9999px;
                          font-weight: bold;
                          font-size: 14px;
                          cursor: pointer;
                        ">Profile</button>
                        <button id="${tooltipId}-follow-${index}" style="
                          background: #1a8cd8;
                          border: none;
                          color: white;
                          padding: 6px 12px;
                          border-radius: 9999px;
                          font-weight: bold;
                          font-size: 14px;
                          cursor: pointer;
                          display: flex;
                          align-items: center;
                          gap: 4px;
                        ">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
                          </svg>
                          Follow
                        </button>
                      </div>
                    </div>

                    <div style="margin-top: 8px; font-size: 14px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: #A0AEC0;">Price at Post</span>
                        <span style="color: white; font-family: monospace; font-weight: bold;">
                          $${marker.price.toFixed(4)}
                        </span>
                      </div>
                      ${impact ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                          <span style="color: #A0AEC0;">Highest After</span>
                          <span style="color: white; font-family: monospace; font-weight: bold;">
                            $${impact.highestPrice.toFixed(4)}
                          </span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                          <span style="color: #A0AEC0;">Return After Tweet</span>
                          <span style="
                            font-family: monospace;
                            font-weight: bold;
                            color: ${impact.priceChange >= 0 ? '#48BB78' : '#E53E3E'};
                          ">
                            ${impact.priceChange >= 0 ? '+' : ''}${impact.priceChange.toFixed(2)}%
                          </span>
                        </div>
                      ` : ''}
                    </div>

                    <div style="margin-top: 8px; color: white; font-size: 14px;">
                      ${tweet.text}
                    </div>
                  </div>
                `;
          }).join('')}
            </div>
          `;
        },
        backgroundColor: 'rgba(45, 45, 79, 0.95)',
        borderWidth: 0,
        extraCssText: 'box-shadow: 0 0 10px rgba(0,0,0,0.3); border-radius: 8px;'
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '15%',
        top: '3%',
        containLabel: true
      },
      dataZoom: [{
        type: 'slider',
        height: 40,
        bottom: '5%',
        start: (range[0] / processedChartData.length) * 100,
        end: (range[1] / processedChartData.length) * 100,
        borderColor: 'transparent',
        backgroundColor: 'rgba(47, 69, 84, 0.3)',
        fillerColor: 'rgba(167,183,204,0.2)',
        handleStyle: {
          color: '#8884d8'
        },
        textStyle: {
          color: '#666'
        }
      }],
      xAxis: {
        type: 'time',
        axisLine: {
          lineStyle: { color: '#333' }
        },
        axisLabel: {
          color: '#666',
          formatter: (value: number) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
          }
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#333',
            width: 1
          }
        },
        axisLabel: {
          color: '#666',
          formatter: (value: number) => value.toFixed(2)
        },
        splitLine: {
          show: false
        }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: processedChartData.map(item => [item.time, item.price]),
          lineStyle: {
            color: '#8884d8',
            width: 1
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#8884d8' },    // 降低顶部不透明度
              { offset: 1, color: 'rgba(136, 132, 216, 0.01)' }     // 降低底部不透明度
            ])
          },
          z: 1
        },
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const point = api.coord([
              api.value(0),
              api.value(1)
            ]);

            const marker = tweetMarkers.find(m => {
              return m.time.getTime() === api.value(0)
            });

            if (!marker || !point) return null;

            const avatars = marker.tweets.slice(0, 5);
            const children: any[] = [];

            // 渲染头像组
            avatars.forEach((tweet, index) => {
              children.push({
                type: 'group',
                children: [
                  {
                  // 修改触发区域的大小和位置
                  type: 'circle',
                  shape: {
                    cx: point[0] + (index * 15) - (avatars.length * 7.5) + 10,
                    cy: point[1],
                    r: 12  // 增加触发区域半径
                  },
                  style: {
                    fill: 'transparent',
                    cursor: 'pointer'
                  },
                  // 添加鼠标事件
                  emphasis: {
                    style: {
                      fill: 'rgba(255,255,255,0.1)'
                    }
                  },
                  silent: false  // 确保事件可以被触发
                },
                  {
                  // 原来的头像渲染
                  type: 'image',
                  style: {
                    image: tweet.profile_image_url,
                    x: point[0] + (index * 15) - (avatars.length * 7.5),
                    y: point[1] - 10,
                    width: 20,
                    height: 20
                  },
                  clipPath: {
                    type: 'circle',
                    shape: {
                      cx: point[0] + (index * 15) - (avatars.length * 7.5) + 10,
                      cy: point[1],
                      r: 10
                    }
                  },
                  silent: false  // 确保事件可以被触发
                }]
              });
            });

            // 如果有更多推文，添加计数标记
            if (marker.tweets.length > 5) {
              children.push({
                type: 'group',
                children: [{
                  type: 'circle',
                  shape: {
                    cx: point[0] + (5 * 15) - (avatars.length * 7.5) + 10,
                    cy: point[1],
                    r: 10
                  },
                  style: {
                    fill: '#3F3F46'
                  }
                }, {
                  type: 'text',
                  style: {
                    text: `+${marker.tweets.length - 5}`,
                    x: point[0] + (5 * 15) - (avatars.length * 7.5) + 10,
                    y: point[1],
                    textAlign: 'center',
                    textVerticalAlign: 'middle',
                    fill: '#ffffff',
                    fontSize: 10
                  }
                }]
              });
            }

            return {
              type: 'group',
              children: children,
              silent: false  // 确保整个组都可以触发事件
            };
          },
          data: visibleTweetMarkers.map(marker => [
            marker.time.getTime(),
            marker.price,
            marker
          ]),
          tooltip: {
            show: true,
            trigger: 'item',
            enterable: true,
            confine: true,
            position: function (point) {
              return [point[0], point[1] + 20];
            }
          }
        }
      ]
    };
  };

  const handleZoom = _.debounce((params: any) => {
    console.log(params);
    
    const newRange = [
      Math.floor(params.start * processedChartData.length / 100),
      Math.ceil(params.end * processedChartData.length / 100)
    ];
    console.log(newRange);
    
    setRange(newRange as [number, number]);
  }, 500)
  return (
    <Box mb={8}>
      <Flex gap={4} mb={4} justifyContent={"space-between"} w={"full"}>
        <VStack align="start" w={"full"}>
          <Text fontSize="sm" color="gray.400">
            Filter by Followers
          </Text>
          <Flex justifyContent={"space-between"} w={"full"}>
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
            <Button onClick={fillFun}>
              <FiSearch></FiSearch>
            </Button>
          </Flex>
        </VStack>
      </Flex>
      <Box position="relative" height="600px">
        {isLoading ? (
          <Loading />
        ) : (
          <ReactECharts
            option={getChartOption()}
            style={{ height: '100%' }}
            onEvents={{
              dataZoom: handleZoom
            }}
          />
        )}
      </Box>
      {isLoading ? (
        <Loading></Loading>
      ) : <RelationChart range={range} data={initialData.priceHistory} tweets={initialData.tweets} relation={initialData.tweetsRelation[0]} />}
      {/* {isLoading ? (
        <Loading></Loading>
      ) : <Relation range={range} data={initialData.priceHistory} tweets={initialData.tweets} relation={initialData.tweetsRelation[0]} />} */}
      {/* {isLoading ? (
        <Loading></Loading>
      ) : <Follow
        range={range}
        priceHistory={initialData.priceHistory} tweets={initialData.tweets} tweetsRelation={initialData.tweetsRelation}></Follow>} */}
    </Box>
  );
};
