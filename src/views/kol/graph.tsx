import {
  Box,
  Flex,
  Card,
  Text
} from "@chakra-ui/react";
import Loading from "@/components/loading";
import ReactECharts from "echarts-for-react";
import { memo, useState, useEffect, useMemo } from "react";
import { getFollowNum, } from "@/api";
import { EChartsOption } from "echarts";
import { KolGraphData } from "@/utils/types";
function KolGraph({ kol, loading, graphData }: {
  kol: string,
  graphData: KolGraphData, loading: boolean
}) {
  const [followData, setFollowData] = useState<{
    total_count: number;
    common_count: number; 
  }>({
    total_count: 0,
    common_count: 0
  });
  console.log( graphData,'graphData')
  const fetchFollowData = async () => {
    const data = await getFollowNum(kol)
    if (data["following data"][0])
      setFollowData(data["following data"][0])
  }
  const option = useMemo<EChartsOption>(() => ({
    series: [
      {
        zoom: 0.5,
        animation: false,
        type: "graph",
        layout: "force",
        force: {
          initLayout: "circular",
          // repulsion: 100,
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
    ]
  }), [graphData])

  useEffect(() => {
    fetchFollowData()
  }, [kol])

  return <Card.Root
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
            {followData.total_count}
          </Text>
        </Box>
        <Box>
          <Text fontWeight="bold" color="#fff">Key KOL Following</Text>
          <Text fontSize="xl" color="#8181E5">
            {/* {followData.common_count} */}
            {
              graphData.data.length && graphData.data.length - 1 
            }
          </Text>
        </Box>
      </Flex>

      <Box w="full" h="1px" bgColor="rgba(255,255,255,.2)" />

      <Box height={{ base: "350px", md: "100%" }}>
        {loading ? (
          <Loading />
        ) : (
          <ReactECharts
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

}

export default memo(KolGraph)