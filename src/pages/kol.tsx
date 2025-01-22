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
  Text,
  VStack,
  Card,
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

      const nodes = res.tweets;

      const centerNode = {
        name: _data?.user,
        symbolSize: 30, // 设置中心点大小
        symbol: `image://${_data?.profile_image_url}`, // 可自定义样式
      };

      const formattedData = nodes.map((node: any, index: number) => ({
        name: node.user + index,
        symbolSize: node.size || 20,
        symbol: node.profile_image_url
          ? `image://${node.profile_image_url}`
          : "circle", // 如果有图片，使用图片节点
      }));
      formattedData.push(centerNode);
      // 格式化链接数据
      const formattedLinks = nodes.map((node: any, index: number) => ({
        source: centerNode.name, // 中心节点作为 source
        target: node.user + index, // 指向每个节点
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
      series: [
        {
          type: "graph",
          layout: "force", // 使用力导向布局
          force: {
            repulsion: 50, // 节点之间的斥力
            edgeLength: [50, 150], // 边的长度范围
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
        const nodeData = params.data as { name: string }
        const userName = nodeData.name as string
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
  return <VStack align="stretch" mt={10}>
  {/* Profile Section */}
  <Flex justify="space-between" align="center" mb={4}>
    <Flex align="center" gap={2}>
      {KolDetail?.profile_image_url && (
        <Avatar size="lg" src={KolDetail?.profile_image_url} />
      )}
      <Box>
        <Flex gap={2}>
          <Text fontWeight="bold">{KolDetail?.user}</Text>
        </Flex>
        <Text fontSize="sm">@{kol}</Text>
      </Box>
    </Flex>
  </Flex>

  <Box w="full" h="1px" bgColor="rgba(255,255,255,.2)"></Box>

  {/* Main Content */}
  <Flex gap={4} height="750px" mt={2}>
    {/* Left Section */}
    <Flex direction="column" gap={4} flex="1" maxWidth="60%">
      {/* Token Card */}
      <Card.Root bg="#1f1b23E1" variant="elevated">
        <Card.Body>
          <Text fontWeight="bold" color="#fff">Token</Text>
          <Flex gap={3}>
            {followTokens?.map((token: any, index: number) => (
              <Link style={{ color: "inherit" }} to={`/token/${token.pair_name_1}`} key={index}>
                <Button bgColor="#3F3F46">{token.pair_name_1}</Button>
             </Link>
            ))}
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Price Change Card */}
      <Card.Root bg="#1f1b23E1" flex="1" variant="elevated">
        <Card.Body p={4}>
          <Text fontWeight="bold" color="#fff">Price Change</Text>
          {loading ? (
            <Loading />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
              >
                <Legend />
                {Xlist?.map((v: string, index: number) => (
                  <Line
                    key={index}
                    type="monotone"
                    dataKey={v}
                    stroke={getColorByIndex(index)}
                    dot={false}
                  />
                ))}
                <XAxis
                  stroke="#8c8c8c"
                  tick={{ fill: "#8c8c8c" }}
                  tickLine={false}
                  interval={6}
                  tickFormatter={(value) => `${value + 1}h`}
                />
                <YAxis
                  stroke="#8c8c8c"
                  tick={{ fill: "#8c8c8c" }}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                  domain={[-100, 100]}
                />
                {/* <Tooltip content={<CustomTooltip />} /> */}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card.Body>
      </Card.Root>
    </Flex>

    {/* Right Section */}
    <Card.Root bg="#1f1b23E1" flex="1" variant="elevated">
      <Card.Body p={4}>
        <Flex justify="space-between" mb={2}>
          <Box>
            <Text fontWeight="bold" color="#fff">Key Following</Text>
            <Text fontSize="xl"color="#8181E5">
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

        <Box w="full" h="1px" bgColor="rgba(255,255,255,.2)"></Box>

        <Flex justify="center" align="center" flex="1" width="100%">
          {loadship ? (
            <Loading />
          ) : (
            <ReactECharts
              ref={chartRef}
              option={option}
              style={{ height: "100%", width: "100%" }}
            />
          )}
        </Flex>
      </Card.Body>
    </Card.Root>
  </Flex>
</VStack>
}