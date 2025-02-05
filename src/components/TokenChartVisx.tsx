import { useState, useMemo, useEffect, memo } from "react";
import { scaleTime, scaleLinear } from '@visx/scale';
import { AreaClosed, Line, Bar } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { Brush } from '@visx/brush';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { localPoint } from '@visx/event';
import { Box, Flex, Text, VStack, HStack } from "@chakra-ui/react";
import { Tweet, PriceHistory } from "@/utils/types";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import Loading from "./loading";
import { Button } from "@/components/ui/button";
import { FaTwitter } from "react-icons/fa";
import { Link } from "react-router";
import { useNavigate } from 'react-router';
import { timeFormat } from 'd3-time-format';

interface TokenChartProps {
  initialData: {
    priceHistory: PriceHistory[];
    tweets: Tweet[];
    tweetsRelation: {
      data: Record<string, string[]>;
      position: string;
    }[];
  };
}

const formatDate = timeFormat("%b %d, %H:%M");
const formatPrice = (value: number) => `$${value.toFixed(2)}`;

const TokenChartVisx = ({ initialData }: TokenChartProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [followerRange, setFollowerRange] = useState<string[]>(["10k-50k", "50k+"]);
  const [range, setRange] = useState<[number, number]>([0, 10]);
  const [tooltipData, setTooltipData] = useState<any>(null);

  const width = 800;
  const height = 600;
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };

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
    const filteredTweets = followerRange.length > 0
      ? initialData.tweets.filter((tweet) =>
        followerRange.includes(getFollowerRange(tweet.followers_count))
      )
      : initialData.tweets;

    filteredTweets.forEach((tweet) => {
      const tweetTime = new Date(tweet.created_at);
      const closestPricePoint = processedChartData.find((pricePoint) => {
        const timeDiff = Math.abs(pricePoint.time.getTime() - tweetTime.getTime());
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

  const xScale = useMemo(() => {
    if (processedChartData.length === 0) {
      return scaleTime({
        domain: [new Date(), new Date()],
        range: [margin.left, width - margin.right],
      });
    }
    return scaleTime({
      domain: [processedChartData[0].time, processedChartData[processedChartData.length - 1].time],
      range: [margin.left, width - margin.right],
    });
  }, [processedChartData]);

  const yScale = useMemo(() => {
    if (processedChartData.length === 0) {
      return scaleLinear({
        domain: [0, 1],
        range: [height - margin.bottom, margin.top],
      });
    }
    return scaleLinear({
      domain: [
        Math.min(...processedChartData.map(d => d.price)),
        Math.max(...processedChartData.map(d => d.price))
      ],
      range: [height - margin.bottom, margin.top],
    });
  }, [processedChartData, height]);

  const onBrushChange = (domain: any) => {
    if (!domain) return;
    const { x0, x1 } = domain;
    const startIndex = processedChartData.findIndex(d => d.time >= x0);
    const endIndex = processedChartData.findIndex(d => d.time >= x1);
    setRange([startIndex, endIndex > -1 ? endIndex : processedChartData.length - 1]);
  };

  const handleTooltip = (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
    const { x } = localPoint(event) || { x: 0 };
    const x0 = xScale.invert(x);
    const index = processedChartData.findIndex(d => d.time >= x0);
    setTooltipData(index >= 0 ? processedChartData[index] : null);
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <Box mb={8}>
      <Flex gap={4} mb={4} justifyContent="space-between">
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
                bg={followerRange.includes(range) ? "blue.500" : "gray.800"}
              >
                {range}
              </Button>
            ))}
          </HStack>
        </VStack>
      </Flex>

      <Box position="relative" height={height}>
        {isLoading ? (
          <Loading />
        ) : (
          <svg width={width} height={height}>
            <LinearGradient
              id="area-gradient"
              from="#8884d8"
              to="#8884d8"
              toOpacity={0.1}
            />

            <Group>
              <AreaClosed
                data={processedChartData}
                x={d => xScale(d.time)}
                y={d => yScale(d.price)}
                yScale={yScale}
                curve={curveMonotoneX}
                fill="url(#area-gradient)"
              />

              <Line
                data={processedChartData}
                x={d => xScale(d.time)}
                y={d => yScale(d.price)}
                stroke="#8884d8"
                strokeWidth={1.5}
                curve={curveMonotoneX}
              />

              {tweetMarkers.map((marker, i) => (
                <foreignObject
                  key={i}
                  x={xScale(marker.time) - 12}
                  y={yScale(marker.price) - 12}
                  width={24}
                  height={24}
                >
                  <Box position="relative">
                    {marker.tweets.length > 1 ? (
                      <AvatarGroup>
                        {marker.tweets.slice(0, 7).map((tweet, i) => (
                          <Link to={`/detail/${tweet.screen_name}`} key={i}>
                            <Avatar w="15px" h="15px" />
                          </Link>
                        ))}
                      </AvatarGroup>
                    ) : (
                      <Link to={`/detail/${marker.tweets[0].screen_name}`}>
                        <Avatar w="15px" h="15px" />
                      </Link>
                    )}
                  </Box>
                </foreignObject>
              ))}

              <AxisBottom
                scale={xScale}
                top={height - margin.bottom}
                tickFormat={formatDate}
                stroke="#666"
                tickStroke="#666"
              />

              <AxisLeft
                scale={yScale}
                left={margin.left}
                tickFormat={formatPrice}
                stroke="#666"
                tickStroke="#666"
              />

              <Bar
                x={margin.left}
                y={margin.top}
                width={width - margin.left - margin.right}
                height={height - margin.top - margin.bottom}
                fill="transparent"
                onTouchStart={handleTooltip}
                onTouchMove={handleTooltip}
                onMouseMove={handleTooltip}
                onMouseLeave={() => setTooltipData(null)}
              />

              <Brush
                xScale={xScale}
                yScale={yScale}
                width={width - margin.left - margin.right}
                height={height - margin.top - margin.bottom}
                margin={margin}
                handleSize={8}
                resizeTriggerAreas={['left', 'right']}
                brushDirection="horizontal"
                initialBrushPosition={{
                  start: { x: xScale(processedChartData[range[0]]?.time) },
                  end: { x: xScale(processedChartData[range[1]]?.time) }
                }}
                // onBrushEnd={onBrushChange}
                // onChange={onBrushChange}
                // onClick={() => setRange([0, processedChartData.length - 1])}
                selectedBoxStyle={{
                  fill: 'rgba(136, 132, 216, 0.1)',
                  stroke: '#8884d8'
                }}
              />
            </Group>
          </svg>
        )}

        {tooltipData && (
          <Box
            position="absolute"
            top={yScale(tooltipData.price) - 40}
            left={xScale(tooltipData.time)}
            transform="translate(-50%, -100%)"
            padding="8px"
            background="rgba(0, 0, 0, 0.8)"
            borderRadius="4px"
            pointerEvents="none"
          >
            <Text color="white" fontSize="sm">
              {formatDate(tooltipData.time)}: {formatPrice(tooltipData.price)}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TokenChartVisx;