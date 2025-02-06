import { memo, useEffect, useMemo, useRef, useState } from 'react';
// import { Graph } from '@visx/network';
import { PriceHistory, Tweet } from '@/utils/types';
import { Avatar, } from "@/components/ui/avatar"
import { Link, useNavigate } from "react-router";
import { FaTwitter } from "react-icons/fa";
import { Tooltip } from './ui/tooltip';
import { Box, Flex, Text } from '@chakra-ui/react';
import { Button } from './ui/button';
const height = 620
export type NetworkProps = {
  width: number;
  height: number;
};

interface CustomNode {
  x: number;
  y: number;
  color?: string;

  created_at: string
  // firestorage_image_url 
  followers_count: number
  id: number
  impact: number
  pair_name_1: string
  profile_image_url: string,
  relation: string[]
  screen_name: string
  text: string
  tweet_id: string
  user: string
}

interface CustomLink {
  source: CustomNode;
  target: CustomNode;
}
const CustomNodeComponent = memo(({ node }: { node: CustomNode }) => {
  // console.log(node, 'node');
  const navigate = useNavigate()
  const ToolTipContent = useMemo(() => <Box overflowY={"auto"} maxHeight={"300px"} p={4} display={"flex"} flexDirection={"column"} gap={4} bg="#2D2D4FF2" borderRadius="lg" color="gray.300" >

    <Box
      // key={i}
      // borderBottomWidth={i !== node.length - 1 ? "1px" : "none"}
      borderColor="#2D2D4F"
    // borderBottomWidth="1px"
    >
      <Flex justify="space-between" align="center" gap={3}>
        <Flex align="center" gap={3}>
          <Avatar
            src={node.profile_image_url}
            size="sm"
            cursor="pointer"
            _hover={{ opacity: 0.8 }}
          />
          <Flex alignItems={"flex-start"} flexDirection={"column"}>
            <Text fontSize={"sm"} fontWeight="bold" color="white" _hover={{ textDecor: "underline" }}>
              {node.user}
            </Text>
            <Text fontSize="sm" color="gray.400">
              @{node.screen_name}·{node.followers_count.toLocaleString()}
            </Text>
            <Text color="gray.400">followers</Text>
          </Flex>
        </Flex>
        <Flex gap={2}>
          <Button onClick={() => { navigate(`/detail/${node.screen_name}`) }} borderRadius={"full"} size="sm" bg="gray.500" _hover={{ bg: "gray.700" }} color="white">
            <Text fontWeight={"bold"}>Profile</Text>
          </Button>
          <Button
            borderRadius={"full"}
            size="sm"
            bg="blue.500"
            color="white"
            onClick={() => window.open(`https://twitter.com/intent/follow?screen_name=${node.screen_name}`, '_blank')}
          >
            <FaTwitter className="text-xs" />
            <Text fontWeight={"bold"}>Follow</Text>
          </Button>
        </Flex>
      </Flex>

      <Text mt={2} fontSize="sm" color="white">
        {node.text}
      </Text>
    </Box>
  </Box>, [node])
  return (
    <foreignObject
      x={-12}
      y={-12}
      width={15}
      height={15}
    >
      <Tooltip closeOnScroll={false} interactive contentProps={
        {
          p: 0, bg: 'transparent', maxWidth: 'none', // 让宽度自动适配内容
          width: '500px'
        }
      }
        content={
          ToolTipContent
        }
      >
        <Box position={"relative"} display={"flex"} alignItems={"center"} cursor={"pointer"}>
          <Link style={{ color: "inherit" }} to={`/detail/${node.screen_name}`}>
            <Avatar w="15px" h="15px" src={node.profile_image_url}></Avatar>
          </Link>
        </Box>
      </Tooltip >
    </foreignObject>
  );
})

export default function Relation({ data, relation, tweets, range }: {
  tweets: Tweet[]
  data: PriceHistory[],
  relation: {
    data: Record<string, string[]>
    position: string
  }
  range: [number, number]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  const position: Record<string, number> = useMemo(() => relation?.position ? JSON.parse(relation.position) : {}, [relation]);
  const times = useMemo(() => data.sort((a, b) => a.time - b.time).map(item => item.time), [data])

  const timeRage = useMemo(() => (
    {
      min: times[range[0]] ?? 0,
      max: times[range[1]] ?? 1
    }
  ), [times, range])

  const priceRange = useMemo(() => {
    const values = Object.values(position)
    if (values.length === 0) return { min: 0, max: 1 };

    let min = values[0];
    let max = min;

    for (let i = 1; i < values.length; i++) {
      const value = values[i];
      if (value < min) min = value;
      if (value > max) max = value;
    }

    return { min: min ?? 0, max: max ?? 1 };
  }, [position]);

  const sortedTweetMarkers = useMemo(() => {
    if (!relation) return [];
    const relationData = relation.data || {};
    return tweets.map(tweet => {
      const tweetId = tweet.tweet_id;
      return {
        ...tweet,
        x: (new Date(tweet.created_at).getTime() - timeRage.min) / (timeRage.max - timeRage.min) * width,
        relation: relationData[tweetId]?.filter(id => id !== tweetId) || [],
        y: position[tweetId] ? (position[tweetId] - priceRange.min) / (priceRange.max - priceRange.min) * height : 0
      };
    }).sort((a, b) => a.y - b.y)
  }, [position, priceRange.max, priceRange.min, relation, timeRage.max, timeRage.min, width, tweets])


  const links: CustomLink[] = useMemo(() => {
    if (!sortedTweetMarkers.length) return []
    const arr: CustomLink[] = []

    sortedTweetMarkers.forEach(marker => {
      arr.push(...marker.relation.map(item => ({
        source: marker, target: sortedTweetMarkers.find(m => m.tweet_id === item) || marker
      })).filter(item => item.source.tweet_id != item.target.tweet_id))
    })

    return arr
  }, [sortedTweetMarkers]);

  const graph = useMemo(() => ({
    nodes: sortedTweetMarkers,
    links,
  }), [sortedTweetMarkers, links]);

  console.log(sortedTweetMarkers, links, timeRage);
  const handleResize = () => {
    if (ref.current) {
      const { width, } = ref.current.getBoundingClientRect();
      setWidth(width)
    }
  };

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <Box ref={ref} width={'full'} height={'full'}  >
      <svg width={width} height={height}>
        <rect width={width} height={height} rx={14} fill='transparent' />
        {/* <Graph<CustomLink, CustomNode>
          graph={graph}
          top={20}
          left={100}
          nodeComponent={CustomNodeComponent as any}
          linkComponent={({ link: { source, target } }) => (
            <line
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="rgba(136, 132, 216, 0.5)"
              strokeWidth="2"
              opacity={0.5}
            />
          )}
        /> */}
      </svg>
    </Box>
  );
}