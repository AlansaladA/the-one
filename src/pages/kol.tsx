import ReactECharts from "echarts-for-react";
import type { ECElementEvent, EChartsOption } from 'echarts';
import {
  getFollowNum,
  getFollowList,
  getFollowTime,
  getTickerOne,
} from "@/api";
import { Params, Follower, FollowTokens, ChartData, KolDetail } from "@/utils/types";
import {
  Box,
  Button,
  Flex,
  VStack,
  Card,
  Text
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar"
import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from 'react-router'
import Loading from "@/components/loading";
import { Link } from "react-router"

export default function Kol() {
  const [followerList, setFollowerList] = useState<Follower[] | undefined>();
  const { kol } = useParams<{ kol: string }>();
  const [followTokens, setFollowTokens] = useState<FollowTokens[]>();
  const [option, setOption] = useState<EChartsOption>({});
  const [graphData, setGraphData] = useState<{ data: any[]; links: any[] }>({
    data: [],
    links: [],
  });
  const [chartData, setChartData] = useState<{ ticker_name: string, growthRate: number[] }[]>([])
  const [Xlist, setXList] = useState<string[]>()
  const [loading, setLoading] = useState(false)
  const [loadship, setLoadShip] = useState(false)
  const [tweetsList, setTweetsList] = useState<KolDetail[]>()
  const chartRef = useRef<ReactECharts | null>(null);
  // const navigate = useNavigate();
  const [selectedLines, setSelectedLines] = useState<string[]>([]);

  useEffect(() => {
    if (kol) {
      getFollow();
      relationship();
      getFollowToken();
    }
  }, [kol]);

  useEffect(() => {
    if (Xlist) {
      setSelectedLines(Xlist);
    }
  }, [Xlist]);

  const getFollow = async () => {
    if (!kol) return
    try {
      const res = await getFollowNum(kol);
      setFollowerList(res["following data"]);
    } catch (error) {
      console.log(error);
    }
  };

  const getFollowToken = async () => {
    if (!kol) return
    try {
      setLoading(true);
      const res = await getFollowTime(kol);
      setFollowTokens(res.tweets);
      setXList(res.tweets.map((time) => time.pair_name_1));
      await fetchAllTokens(res.tweets);
    } catch (error) {
      // toast.error(error instanceof Error ? error.message : "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTokens = async (followTokens: FollowTokens[]) => {
    if (!followTokens?.length) return;

    const res = await Promise.all(
      followTokens.map(async (token) => {
        try {
          const result = await getTickerOne(token.pair_name_1)
          return {
            ticker_name: result.ticker_name,
            history: result.history.map((item) => ({
              time: new Date(item.download_time).getTime(),
              price: parseFloat(item.close),
              volume: parseFloat(item.volume),
              name: item.name,
            })).sort((a, b) => a.time - b.time),
            first_created_at: new Date(token.first_created_at).getTime(),
          }
        } catch (error) {
          // toast.error(error instanceof Error ? error.message : "error");
          return null;
        }
      })
    );

    const validRes = res.map((item) => {
      const filteredHistory = item?.history.filter((value) => {
        return value.time >= item.first_created_at
      }) || [];

      const paddedHistory = [...filteredHistory];
      if (paddedHistory.length < 120 && paddedHistory.length > 0) {
        const lastItem = paddedHistory[paddedHistory.length - 1];
        while (paddedHistory.length < 120) {
          paddedHistory.push({ ...lastItem });
        }
      }

      return {
        ticker_name: item?.ticker_name,
        first_created_at: item?.first_created_at,
        history: paddedHistory.slice(0, 120)
      }
    })

    const list = validRes
      .filter(item => item?.ticker_name)
      .map(item => {
        const basePrice = item.history[0]?.price || 0;
        return {
          ticker_name: item.ticker_name as string,
          growthRate: item.history.map(h => {
            if (basePrice === 0) return 0;
            return ((h.price - basePrice) / basePrice) * 100;
          })
        };
      });
    setChartData(list)
  };

  const relationship = async () => {
    if (!kol) return
    try {
      setLoadShip(true);
      const res = await getFollowList(kol);
      setTweetsList(res.tweets);
      const _data =
        res.tweets.filter((v) => v.Following === kol)[0] ?? {};

      const nodes = res.tweets.filter((v) => v.Following !== kol);

      const centerNode = {
        name: _data?.Following,
        symbolSize: 30, // 设置中心点大小
        symbol: `image://${_data?.profile_image_url}`,
      };

      const formattedData = nodes.map((node: any, index: number) => ({
        name: node.Following + "-" + index,
        symbolSize: node.size || 20,
        symbol: node.profile_image_url
          ? `image://${node.profile_image_url}`
          : "circle", // 如果有图片，使用图片节点
      }));
      formattedData.push(centerNode);
      // 格式化链接数据
      const formattedLinks = nodes.map((node: any, index: number) => ({
        source: centerNode.name, // 中心节点作为 source
        target: node.Following + "-" + index, // 指向每个节点
        value: [0, 100, 200][index % 3], // 线长
      }));

      setGraphData({
        data: formattedData,
        links: formattedLinks,
      });
    } catch (error) {
      // toast.error(error instanceof Error ? error.message : "error");
    } finally {
      setLoadShip(false);
    }
  };

  const KolDetail = useMemo(() => {
    if (tweetsList?.length) {
      return tweetsList.filter(v => v.Following === kol)[0] ?? {}
    } else {
      return {
        profile_image_url: "",
        user: ""
      }
    }
  }, [tweetsList]);

  const getLineChartOption = useMemo(() => {
    if (!chartData || !Xlist) return {};

    const series = Xlist.map((name, index) => ({
      name: name,
      type: 'line',
      data: chartData.find(item => item.ticker_name === name)?.growthRate || [],
      symbol: 'none',
      lineStyle: {
        width: 1,
        // color: getColorByIndex(index)
      }
    }));

    return {
      animation: false,
      progressive: 500,
      progressiveThreshold: 3000,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#312d4c',
        borderRadius: 8,
        padding: 10,
        textStyle: {
          color: '#fff'
        },
        formatter: (params: any) => {
          let result = `<div style="color: #fff">`;
          result += `<div>${params[0].axisValue}</div>`;
          params.forEach((item: any) => {
            result += `<div><strong>${item.seriesName}:</strong> ${Number(item.value).toFixed(2)}%</div>`;
          });
          result += '</div>';
          return result;
        },
        showDelay: 50,
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 0,
        textStyle: {
          color: '#8c8c8c'
        },
        selected: Xlist.reduce((acc, name) => {
          acc[name] = selectedLines.includes(name);
          return acc;
        }, {} as Record<string, boolean>)
      },
      grid: {
        top: 60,
        left: 50,
        right: 50,
        bottom: 30
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: chartData[0]?.growthRate?.length || 120 }, (_, index) => `${index}h`),
        axisLabel: {
          color: '#8c8c8c',
          interval: 7  // 每8个点显示一个标签（因为索引从0开始）
        }
      },
      yAxis: {
        type: 'value',
        min: -100,
        axisLine: {
          show: false  // 隐藏轴线
        },
        axisTick: {
          show: false  // 隐藏刻度线
        },
        splitLine: {
          show: false  // 隐藏网格线
        },
        axisLabel: {
          formatter: (value: number) => `${value}%`
        }
      },
      series
    };
  }, [chartData, Xlist, selectedLines]);

  useEffect(() => {
    setOption({
      series: [
        {
          zoom: 0.5,
          animation: false,
          type: "graph",
          layout: "force",
          force: {
            initLayout: "circular",
            repulsion: 100,
            edgeLength: [50, graphData.data.length],
          },
          roam: true,
          scaleLimit: {
            // min: 0.4,
            max: 5
          },
          data: graphData.data,
          links: graphData.links,
          emphasis: {
            focus: "adjacency",
            lineStyle: {
              width: 10,
            },
          },
          label: {
            show: false,
            position: "right",
          },
          lineStyle: {
            color: "source",
            curveness: 0.3,
          }
        },
      ],
    })
  }, [graphData]);

  return <VStack align="stretch" mt={4} px={{ base: 4, md: 40 }}>
    {/* Profile Section */}
    <Flex justify="space-between" align="center" mb={4}>
      <Flex align="center" gap={2}>
        {KolDetail?.profile_image_url && (
          <Avatar size={{ base: "md", md: "lg" }} src={KolDetail?.profile_image_url} />
        )}
        <Box>
          <Flex gap={2}>
            <Text fontWeight="bold">{KolDetail?.user}</Text>
          </Flex>
          <Text fontSize="sm">@{kol}</Text>
        </Box>
      </Flex>
    </Flex>

    <Box w="full" h="1px" bgColor="rgba(255,255,255,.2)" />
    {/* Main Content */}
    <Flex
      direction={{ base: "column", md: "row" }}
      gap={4}
      height={{ base: "auto", md: "750px" }}
      mt={2}
    >
      {/* Left Section */}
      <Flex
        direction="column"
        gap={4}
        flex="1"
        maxWidth={{ base: "100%", md: "60%" }}
      >
        {/* Token Card */}
        <Card.Root bg="#1f1b23E1" variant="elevated">
          <Card.Body pb={2}>
            <Text fontWeight="bold" color="#fff">Token</Text>
            <Flex
              gap={3}
              overflowX="auto"
              pb={5}

            // sx={{
            //   '::-webkit-scrollbar': {
            //     height: '4px',
            //   },
            //   '::-webkit-scrollbar-thumb': {
            //     backgroundColor: 'rgba(255,255,255,0.2)',
            //     borderRadius: '2px',
            //   },
            // }}
            >
              {followTokens?.map((token: any, index: number) => (
                <Link style={{ color: "inherit", flexShrink: 0 }} to={`/token/${token.pair_name_1}`} key={index}>
                  <Button bgColor="#3F3F46" size={{ base: "sm", md: "md" }}>
                    <Text color="#fff">{token.pair_name_1}</Text>
                  </Button>
                </Link>
              ))}
            </Flex>
          </Card.Body>
        </Card.Root>

        {/* Price Change Card */}
        <Card.Root bg="#1f1b23E1" flex="1" variant="elevated">
          <Card.Body p={4}>
            <Text fontWeight="bold" color="#fff">Price Change</Text>
            <Box height={{ base: "300px", md: "100%" }}>
              {loading ? (
                <Loading />
              ) : (
                <ReactECharts
                  option={getLineChartOption}
                  style={{ height: "100%", width: "100%" }}
                  notMerge={true}
                  lazyUpdate={true}
                  // onEvents={{
                  //   legendselectchanged: (params) => {
                  //     setSelectedLines(
                  //       Object.entries(params.selected)
                  //         .filter(([_, selected]) => selected)
                  //         .map(([name]) => name)
                  //     );
                  //   }
                  // }}
                />
              )}
            </Box>
          </Card.Body>
        </Card.Root>
      </Flex>

      {/* Right Section */}
      <Card.Root
        bg="#1f1b23E1"
        flex="1"
        variant="elevated"
        minHeight={{ base: "400px", md: "auto" }}
      >
        <Card.Body p={4}>
          <Flex justify="space-between" mb={2}>
            <Box>
              <Text fontWeight="bold" color="#fff">Key Following</Text>
              <Text fontSize="xl" color="#8181E5">
                {followerList?.[0].total_count}
              </Text>
            </Box>
            <Box>
              <Text fontWeight="bold" color="#fff">Key KOL Following</Text>
              <Text fontSize="xl" color="#8181E5">
                {followerList?.[0].common_count}
              </Text>
            </Box>
          </Flex>

          <Box w="full" h="1px" bgColor="rgba(255,255,255,.2)" />

          <Box height={{ base: "350px", md: "100%" }}>
            {loadship ? (
              <Loading />
            ) : (
              <ReactECharts
                ref={chartRef}
                option={option}
                style={{ height: "100%", width: "100%" }}
                onEvents={{
                  click: (params) => {
                    if (params.dataType === 'node') {
                      const nodeData = params.data as { name: string }
                      const userName = nodeData.name.replace(/-[^-]*$/, "");
                      window.open(`https://x.com/${userName}`, '_blank');
                    }
                  }
                }}
              />
            )}
          </Box>
        </Card.Body>
      </Card.Root>
    </Flex>
  </VStack>
}