import { useState, useMemo, useEffect, useRef } from "react";
import _ from 'lodash';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from 'react-router'
import { Tweet, PriceHistory } from "@/utils/types";
import Loading from "./loading";
import { Button } from "@/components/ui/button"
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import RelationChart from "./relationEchart";
import { Tooltip } from "@/components/ui/tooltip"
import { IoExpand } from "react-icons/io5";
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

    return markers;
  }, [initialData.tweets, processedChartData, followerRange]);


  const filterTweets = useMemo(() => {
    const filteredTweets = followerRange.length > 0
      ? initialData.tweets.filter((tweet) =>
          followerRange.includes(getFollowerRange(tweet.followers_count))
        )
      : initialData.tweets;

    return filteredTweets.filter((tweet) => {
      const tweetTime = new Date(tweet.created_at);
      const closestPricePoint = processedChartData.find((pricePoint) => {
        const timeDiff = Math.abs(
          pricePoint.time.getTime() - tweetTime.getTime()
        );
        return timeDiff <= 3600000; // 1小时内
      });
      
      return closestPricePoint !== undefined; // 只保留有对应价格点的推文
    });
  }, [initialData.tweets, followerRange, processedChartData]);



  useEffect(() => {
    if (processedChartData.length > 0) {
      setIsLoading(false);
    }
  }, [processedChartData]);
  const [range, setRange] = useState<[number, number]>([0, initialData.priceHistory.length - 1])

  useEffect(() => {
    console.log(processedChartData, 'processedChartData');
    // Mon, 02 Dec 2024 15:10:25 GMT

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

  const fillFun = () => {
    // 更新 range 为完整数据范围
    setRange([0, initialData.priceHistory.length - 1]);
  }

  // 添加 echartRef
  const echartRef = useRef(null);

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
      // // 优化性能的配置
      progressive: 500,  // 渐进式渲染，每帧渲染的数据点数量
      progressiveThreshold: 3000,  // 超过这个数量开启渐进式渲染

      // 优化交互性能
      animation: false,  // 关闭动画可以提升性能
      throttle: 100,    // 设置节流阈值

      // 优化图片加载
      imageCache: true,  // 开启图片缓存
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
                    padding-bottom: 8px;
                    margin-bottom: 16px;
                    border-bottom: ${index !== marker.tweets.length - 1 ? '1px solid #2D2D4F' : 'none'};
                    display: flex;
                    flex-direction: column;
                    flex-wrap: wrap;
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

                    <div style="width: 200px;margin-top: 8px; color: white; font-size: 14px;display: flex;flex-direction: column;flex-wrap: wrap;">
                      <span>
                       ${tweet.text}
                      </span>
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
        top: '8%',
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
          color: '#8884d8',
          cursor: 'pointer'
        },
        moveHandleStyle: {
          cursor: 'pointer'
        },
        textStyle: {
          color: '#666'
        },
        brushSelect: false,
        dataBackground: {
          lineStyle: {
            cursor: 'pointer'
          },
          areaStyle: {
            cursor: 'pointer'
          }
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
        },
        // min: processedChartData[range[0]]?.time,
        // max: processedChartData[range[1]]?.time
      },
      yAxis: {
        type: 'value',
        name: 'Price',  // y轴标签
        nameLocation: 'end', // 将标签位置改为end（顶部）
        nameGap: 15,  // 减小标签与轴的距离
        nameTextStyle: {  // 标签文字样式
          color: '#666',
          fontSize: 14,
          padding: [0, 0, 0, -20]
        },
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
          data: tweetMarkers.map(marker => [
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
    const newRange = [
      Math.floor(params.start * processedChartData.length / 100),
      Math.ceil(params.end * processedChartData.length / 100) - 1
    ];
    setRange(newRange as [number, number]);
  }, 500)
  return (
    <Box mb={8}>
      {/* <span style={{fontSize:"16px"}}>When did a KOL post a tweet about the token?</span> */}
      <Flex gap={4} mb={4} justifyContent={"space-between"} w={"full"}>
        <VStack align="start" w={"full"}>
          <Text fontSize="sm" color="gray.400">
            Filter by Followers
          </Text>
          <Flex justifyContent={"space-between"} w={"full"}>
            <HStack>
              {(["10k-50k", "50k+"] as const).map((range) => (
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
                  bg={followerRange.includes(range) ? "blue.500" : "gray.800"}
                >
                  {range}
                </Button>
              ))}
            </HStack>
            <Button onClick={fillFun}>
              <IoExpand></IoExpand>
            </Button>
          </Flex>
        </VStack>
      </Flex>
      <Box position="relative" height="600px" mb={4}>
        {isLoading ? (
          <Loading />
        ) : (
          <ReactECharts
            ref={echartRef}
            option={getChartOption()}
            style={{ height: '100%' }}
            onEvents={{
              dataZoom: handleZoom
            }}
          />
        )}
      </Box>
      {/* <Tooltip content="How KOLs Are Potentially Influenced by Each Other" showArrow>
        <span style={{fontSize:"16px"}}>Meme Propagation Map</span>
      </Tooltip> */}
      {!isLoading && <RelationChart range={range} data={initialData.priceHistory} tweets={filterTweets} relation={initialData.tweetsRelation[0]} />}

      {/* <RelationChart range={range} data={initialData.priceHistory} tweets={initialData.tweets} relation={initialData.tweetsRelation[0]} /> */}
    </Box>
  );
};
