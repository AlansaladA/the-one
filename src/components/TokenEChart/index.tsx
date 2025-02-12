import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import _ from 'lodash';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from 'react-router'
import { Tweet, Price } from "@/utils/types";
import Loading from "../loading";
import { Button } from "@/components/ui/button"
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import RelationChart, { RelationChartRef } from "../relationEchart";
import { Tooltip } from "@/components/ui/tooltip"
import { IoExpand } from "react-icons/io5";
export default function TokenEChart({
  initialData,
}: {
  initialData: { priceData: Price[]; tweets: Tweet[], tweetsRelation: any };
}) {
  const relationChartRef = useRef<RelationChartRef>(null);
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true);
  const [followerRange, setFollowerRange] = useState<string[]>(["10k-50k", "50k+"]);

  const getFollowerRange = (followersCount: number): string => {
    if (followersCount < 5000) return "0-5k";
    if (followersCount < 10000) return "5k-10k";
    if (followersCount < 50000) return "10k-50k";
    return "50k+";
  };

  const tweetMarkers = useMemo(() => {
    const filteredTweets =
      followerRange.length > 0
        ? initialData.tweets.filter((tweet) =>
          followerRange.includes(getFollowerRange(tweet.followers_count))
        )
        : initialData.tweets;

   
    // 创建一个包含价格时间点和推文时间点的数组 
    const allTimePoints = [...initialData.priceData.map(point => point.time),
    ...filteredTweets.map(tweet => new Date(tweet.created_at).getTime())
    ]

    // 按时间排序并去重
    const uniqueTimePoints = Array.from(new Set(
      allTimePoints.map(time => time)
    )).sort((a, b) => a - b);
    // 创建一个 Map 来存储推文时间和推文的对应关系
    const tweetTimeMap = new Map<number, Tweet[]>();
    filteredTweets.forEach(tweet => {
      const time = new Date(tweet.created_at).getTime();
      if (tweetTimeMap.has(time)) {
        tweetTimeMap.get(time)!.push(tweet);
      } else {
        tweetTimeMap.set(time, [tweet]);
      }
    });

    
    // 遍历所有时间点，进行插值
    const markers = uniqueTimePoints.map(time => {
      // 查找最近的价格点
      const nearestPricePoint = initialData.priceData.reduce((nearest, current) => {
        const currentDiff = Math.abs(current.time - time);
        const nearestDiff = Math.abs(nearest.time - time);
        return currentDiff < nearestDiff ? current : nearest;
      }, initialData.priceData[0]);

      // 检查这个时间点是否有对应的推文
      const tweets = tweetTimeMap.get(time);
      return ({
        time,
        price: nearestPricePoint.price,
        tweets: tweets || [],
      });
    });

    return markers;
  }, [followerRange, initialData.tweets, initialData.priceData]);

  const markerRange = useMemo(() => {
    console.log(tweetMarkers, "tweetMarkers");
    
    if (tweetMarkers.length > 0) {
      let firstTweetIndex = -1;
      let lastTweetIndex = -1;

      for (let i = 0; i < tweetMarkers.length; i++) {
        if (tweetMarkers[i].tweets.length > 0) {
          if (firstTweetIndex === -1) {
            firstTweetIndex = tweetMarkers[i].time;
          }
          lastTweetIndex = tweetMarkers[i].time;
        }
      }

      if (firstTweetIndex !== -1 && lastTweetIndex !== -1) {
        return [firstTweetIndex, lastTweetIndex];
      }
    }
    return [0, 0]
  }, [tweetMarkers])

  // useEffect(() => {
  //   if (initialData.priceData.length > 0) {
  //     setIsLoading(false);
  //   }
  // }, [initialData.priceData]); 

  const fillFun = useCallback(() => {
    // 更新 range 为完整数据范围

    relationChartRef.current?.setRange([0, 100]);
    echartRef.current?.getEchartsInstance().dispatchAction({
      type: 'dataZoom',
      start: 0,
      end: 100
    });
  }, [tweetMarkers])

  useEffect(() => {
    relationChartRef.current?.initRange(markerRange);
  }, [markerRange])
  // 添加 echartRef
  const echartRef = useRef<ReactECharts>(null);
  const calculateImpact = (tweet: Tweet, currentPrice: number) => {
    const tweetTime = new Date(tweet.created_at).getTime();
    const laterPrices = initialData.priceData.filter(
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

  const getChartOption = useCallback(() => {
    return {
      dataset: {
        source: tweetMarkers.map(marker => [marker.time, marker.price, marker])
      },
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
          console.log(params);

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
                      <div> 
                       <div style="font-size: 14px; color: #A0AEC0;margin-bottom: 8px;text-align: right;">
                ${dayjs(tweet.created_at).format('YYYY-MM-DD HH:mm')} 
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
        bottom: 50,
        top: '8%',
        containLabel: true
      },
      dataZoom: [{
        type: 'slider',
        height: 40,
        bottom: '5%',
        borderColor: 'transparent',
        backgroundColor: 'rgba(47, 69, 84, 0.3)',
        fillerColor: 'rgba(167,183,204,0.2)',
        handleStyle: {
          color: '#8884d8',
          cursor: 'pointer'
        },
        textStyle: {
          color: '#666'
        },
        brushSelect: false,
        startValue: markerRange[0],
        endValue: markerRange[1]
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
          // formatter: (value: number) => value.toFixed(2)
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
          renderItem: (params, api) => {
            const point = api.coord([
              api.value(0),
              api.value(1)
            ]);

            const marker = tweetMarkers[params.dataIndex];

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
  }, [tweetMarkers])

  const zoomFunc = useCallback((params: any) => {
    relationChartRef.current?.setRange([params.start, params.end]);
  }, [tweetMarkers])
  const handleZoom = _.debounce(zoomFunc, 500)

  return (
    <Box mb={8}>
      <span style={{ fontSize: "16px" }}>When did a KOL post a tweet about the token?</span>
      <Flex gap={4} mb={4} justifyContent={"space-between"} w={"full"}>
        <VStack align="start" w={"full"}>
          <Text fontSize="sm" color="gray.400">
            Filter by number of followers
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
        <ReactECharts
          ref={echartRef}
          option={getChartOption()}
          style={{ height: '100%' }}
          onEvents={{
            dataZoom: handleZoom
          }}
        />
      </Box>
      <Tooltip content="An A to B arrow indicates B may be influenced by A" showArrow>
        <span style={{ fontSize: "16px" }}>Meme propagation map: how KOLs are potentially influenced by each other</span>
      </Tooltip>
      <RelationChart defaultRange={markerRange} ref={relationChartRef} tweets={tweetMarkers} relation={initialData.tweetsRelation[0]} />
    </Box>
  );
};