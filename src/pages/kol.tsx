import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ReactECharts from "echarts-for-react";
import type { ECElementEvent } from 'echarts';
import {
  getFollowNum,
  getFollowList,
  getFollowTime,
  getTickerOne,
} from "@/api";
import { Params, Follower, FollowTokens, ChartData, KolDetail } from "@/utils/types";
import {
  // Avatar,
  Box,
  Button,
  // Divider,
  Flex,
  VStack,
  Card,
  Text
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar"
import { useEffect, useMemo, useState, Suspense, useRef } from "react";
import { useParams, useNavigate } from 'react-router'
import { mergeData, processHistory,getColorByIndex } from "@/utils/index"
import Loading from "@/components/loading";
import { Link } from "react-router"

export default function kol() {
  const [followerList, setFollowerList] = useState<Follower[] | undefined>();
  const { kol } = useParams<{ kol: string }>();
  const [followTokens, setFollowTokens] = useState<FollowTokens[]>();
  const [option, setOption] = useState({});
  const [graphData, setGraphData] = useState<{ data: any[]; links: any[] }>({
    data: [],
    links: [],
  });
  const [chartData, setChartData] = useState<ChartData[]>()
  const [Xlist, setXList] = useState<string[]>()
  const [loading, setLoading] = useState(false)
  const [loadship, setLoadShip] = useState(false)
  const [loadTweet, setLoadTweet] = useState(false)
  const [tweetsList, setTweetsList] = useState<KolDetail[]>()
  const chartRef = useRef<ReactECharts | null>(null);
  const [hiddenLines, setHiddenLines] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (kol) {
      getFollow();
      relationship();
      getFollowToken();
    }
  }, [kol]);

  const getFollow = async () => {
    if(!kol) return
    try {
      const res = await getFollowNum(kol);
      setFollowerList(res["following data"]);
    } catch (error) {

    }
  };

  const getFollowToken = async () => {
    if(!kol) return
    try {
      setLoading(true);
      const res = await getFollowTime(kol);
      setFollowTokens(res.tweets);
      setXList(res.tweets.map((time) => time.pair_name_1));
      fetchAllTokens(res.tweets);
    } catch (error) {
      // toast.error(error instanceof Error ? error.message : "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTokens = async (followTokens: FollowTokens[]) => {
    if (followTokens?.length) {
      const res = await Promise.all(
        followTokens.map(async (token) => {
          try {
            return await getTickerOne(token.pair_name_1);
          } catch (error) {
            // toast.error(error instanceof Error ? error.message : "error");
            return null;
          }
        })
      );

      // 过滤掉返回 null 的结果
      const validRes = res.filter((item) => item !== null);

      const list = validRes.map((item, index) => {
        const filterTime = followTokens.filter(
          (v) => v.pair_name_1 === item.ticker_name
        )[0]?.first_created_at;
        return processHistory(item.history, filterTime);
      });

      const merged = mergeData(list);
      // console.log(merged);

      setChartData(merged);
    }
  };

  const relationship = async () => {
    if(!kol) return
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
        symbol: `image://${_data?.profile_image_url}`, // 可自定义样式
      };

      const formattedData = nodes.map((node: any, index: number) => ({
        name: node.Following +"-"+ index,
        symbolSize: node.size || 20,
        symbol: node.profile_image_url
          ? `image://${node.profile_image_url}`
          : "circle", // 如果有图片，使用图片节点
      }));
      formattedData.push(centerNode);
      // 格式化链接数据
      const formattedLinks = nodes.map((node: any, index: number) => ({
        source: centerNode.name, // 中心节点作为 source
        target: node.Following +"-"+ index, // 指向每个节点
        value: node.relationship || 1, // 可自定义关系值
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

  useEffect(() => {
    setOption({
      toolbox: {
        show: true,
        feature: {
          dataZoom: {
            show: true
          },
          restore: {
            show: true
          },
          saveAsImage: {
            show: true
          }
        },
        iconStyle: {
          borderColor: '#fff'
        }
      },
      series: [
        {
          type: "graph",
          layout: "force", // 使用力导向布局
          force: {
            repulsion: 50, // 节点之间的斥力
            edgeLength: [50, 150], // 边的长度范围
          },
          roam: true, // 启用缩放和平移
          scaleLimit: {
            min: 0.4, // 最小缩放比例
            max: 2    // 最大缩放比例
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
            color: "source", // 边的颜色与源节点一致
            curveness: 0.3, // 弯曲度
          },
          toolbox: {
            feature: {
              dataZoom: {
                show: true,
                yAxisIndex: "none",
              },
            },
          },
        },
      ],
    })
  }, [graphData]);

  useEffect(() => {
    if (!chartRef.current) return;
    const chartInstance = chartRef.current.getEchartsInstance();

    const onChartClick = (params: ECElementEvent) => {
      if (params.dataType === 'node') {
        console.log(params.data,'nodeData');
        
        const nodeData = params.data as { name: string }
        const userName = nodeData.name.replace(/-[^-]*$/, "");
        console.log(userName);
        
        window.open(`https://x.com/${userName}`, '_blank');
        // 使用立即执行的异步函数来处理异步操作
        // (async () => {
        //   try {
        //     // setLoadTweet(true)
        //     const res = await getFollowList(userName);
        //     console.log("231");

        //     if (res.tweets.length > 0) {
        //       console.log('ioioioiotytuytu');
        //       navigate.push(`/detail/${userName}`);
        //     } else {
        //       console.log('ioioioio');

        //       window.open(`https://x.com/${userName}`, '_blank');
        //     }
        //   } catch (error) {  
        //     console.log(error);

        //     window.open(`https://x.com/${userName}`, '_blank');    
        //   }
        // })();
      }
    };

    chartInstance.on('click', onChartClick);

    // 清理函数
    return () => {
      chartInstance.off('click', onChartClick);
    };
  }, [chartRef.current])



  const handleLegendClick = (e) => {
    setHiddenLines((prev) => ({
      ...prev,
      [e.dataKey]: !prev[e.dataKey], // 切换折线的隐藏状态
    }));
  };
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
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
                  >
                    <Legend onClick={handleLegendClick}/>
                    {Xlist?.map((v: string, index: number) => (
                      <Line
                        key={index}
                        type="monotone"
                        dataKey={v}
                        stroke={getColorByIndex(index)}
                        dot={false}
                        hide={hiddenLines[v]}
                      />
                    ))}
                    <XAxis
                      stroke="#8c8c8c"
                      tick={{ fill: "#8c8c8c" }}
                      tickLine={false}
                      // interval={window.innerWidth < 768 ? 24 : 6}
                      tickFormatter={(value) => `${value + 1}h`}
                    />
                    <YAxis
                      stroke="#8c8c8c"
                      tick={{ fill: "#8c8c8c" }}
                      tickLine={false}
                      tickFormatter={(value) => `${value}%`}
                      domain={[-100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </LineChart>
                </ResponsiveContainer>
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
              />
            )}
          </Box>
        </Card.Body>
      </Card.Root>
    </Flex>
  </VStack>
}

const CustomTooltip = ({ payload, label }: any) => {
  if (!payload || payload.length === 0) return null;

  return (
    <Flex
      flexDirection={"column"}
      style={{
        backgroundColor: "#312d4c",
        borderRadius: "8px",
        color: "#fff",
        padding: "10px",
      }}
    >
      <Text>{label+1+"h"}</Text>
      {payload.map((entry: any, index: number) => {
        const value = entry.value;
        return (
          <p key={index}>
            <strong>{entry.name}:</strong> {value}%
          </p>
        );
      })}
    </Flex>
  );
};