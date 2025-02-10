import { Tweet } from '@/utils/types';
import * as echarts from 'echarts';
import _ from 'lodash';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router';

interface CustomNode {
  x: number;
  y: number;
  color?: string;
  name: string,
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
  source: string;
  target: string;
  symbol?: [string, string];  // 添加可选的 symbol 属性
}
const itemDelay = 2
const customAvatar = 'https://pbs.twimg.com/profile_images/1867692977734254592/j-GvEEZI_normal.jpg'
const getTooltipFormatter = (params) => {
  const { data: node } = params.data;
  return `
    <div style="max-height: 300px; padding: 16px; display: flex; flex-direction: column; gap: 16px; background: #2D2D4FF2; border-radius: 8px; color: #CBD5E0; width: 500px; overflow-y: auto;">
      <div style="border-color: #2D2D4F;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img 
              src="${node.profile_image_url}" 
              style="width: 32px; height: 32px; border-radius: 9999px; cursor: pointer;"
              onmouseover="this.style.opacity=0.8"
              onmouseout="this.style.opacity=1"
            />
            <div style="display: flex; flex-direction: column; align-items: flex-start;">
              <div style="font-size: 14px; font-weight: bold; color: white; text-decoration: none;">
                ${node.user}
              </div>
              <div style="font-size: 14px; color: #A0AEC0;">
                @${node.screen_name}·${node.followers_count.toLocaleString()}
              </div>
              <div style="color: #A0AEC0;">
                followers
              </div>
            </div>
          </div>
          <div>
          <div style="font-size: 14px; color: #A0AEC0;margin-bottom: 8px;text-align: right;">
                ${dayjs(node.created_at).format('YYYY-MM-DD HH:mm')} 
              </div>
          <div style="display: flex; gap: 8px;">
            <button 
              onclick="(() => { window.reactNavigate('/detail/${node.screen_name}') })()"
              style="border-radius: 9999px; padding: 6px 12px; background: #4A5568; color: white; font-weight: bold; border: none; cursor: pointer;"
              onmouseover="this.style.background='#2D3748'"
              onmouseout="this.style.background='#4A5568'"
            >
              Profile
            </button>
            <button 
              onclick="window.open('https://twitter.com/intent/follow?screen_name=${node.screen_name}', '_blank')"
              style="border-radius: 9999px; padding: 6px 12px; background: #3182CE; color: white; font-weight: bold; border: none; cursor: pointer; display: flex; align-items: center; gap: 4px;"
              onmouseover="this.style.background='#2B6CB0'"
              onmouseout="this.style.background='#3182CE'"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path>
              </svg>
              Follow
            </button>
          </div>
        </div></div>
        <div style="margin-top: 8px; font-size: 14px; color: white;">
          ${node.text}
        </div>
      </div>
    </div>
  `;
}
export type RelationChartRef = {
  setRange: (newRange: number[]) => void;
  initRange: (newRange: number[]) => void;
}
const RelationChart = forwardRef<RelationChartRef, {
  defaultRange: number[];
  tweets: {
    time: number;
    price: number;
    tweets: Tweet[];

  }[]
  relation: {
    data: Record<string, string[]>
    position: string
  }
}>(({ relation, tweets, defaultRange }, ref) => {
  const navigate = useNavigate();

  useImperativeHandle(ref, () => ({
    setRange(newRange: number[]) {
      if (!chartInstance.current) return;
      chartInstance.current.dispatchAction({
        type: 'dataZoom',
        start: newRange[0],
        end: newRange[1]
      })
    },
    initRange(newRange: number[]) {
      if (!chartInstance.current) return;

      chartInstance.current.dispatchAction({
        type: 'dataZoom',
        startValue: newRange[0],
        endValue: newRange[1]
      })
    }
  }), [])

  const sortedTweetMarkers = useMemo<CustomNode[]>(() => {
    if (!relation) return [];

    const position = relation?.position ? JSON.parse(relation.position) : {}
    const relationMap = new Map(Object.entries(relation.data || {}));
    const positionMap = new Map<string, number>(Object.entries(position));

    // 为每个时间点创建标记
    const markers = tweets.flatMap(timePoint => {
      // 如果这个时间点没有推文，也返回一个空的标记保持时间轴一致
      if (timePoint.tweets.length === 0) {
        return [{
          name: `empty-${timePoint.time}`,
          x: timePoint.time,
          y: 0,
          relation: [],
          // 添加其他必需的 CustomNode 属性
          created_at: new Date(timePoint.time).toISOString(),
          followers_count: 0,
          id: 0,
          impact: 0,
          pair_name_1: '',
          profile_image_url: '',
          screen_name: '',
          text: '',
          tweet_id: '',
          user: ''
        }];
      }

      // 处理有推文的时间点
      return timePoint.tweets.map(item => {
        const tweetId = item.tweet_id;
        return ({
          ...item,
          name: tweetId,
          x: timePoint.time,
          relation: relationMap.get(tweetId)?.filter(id => id !== tweetId) || [],
          y: positionMap.get(tweetId) ?? 0
        });
      });
    });

    return markers;
  }, [relation, tweets]);


  const links = useMemo<CustomLink[]>(() => {
    const result: CustomLink[] = [];
    const processedPairs = new Set<string>();
    const makersMap = new Map<string, CustomNode>(sortedTweetMarkers.map(tweet => [tweet.name, tweet]));

    sortedTweetMarkers.forEach(tweet => {
      tweet.relation.forEach(targetId => {
        // 检查是否已经处理过这对关系
        const pairKey = [tweet.name, targetId].sort().join('-');
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);

        // 检查是否存在双向关系
        const target = makersMap.get(targetId);
        const isBidirectional = target?.relation.includes(tweet.name);
        result.push({
          target: tweet.name,
          source: targetId,
          symbol: isBidirectional ? ['none', 'none'] : ['none', 'arrow']
        });
      });
    });

    return result;
  }, [sortedTweetMarkers]);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  // 添加 resize 处理函数
  const debouncedResize = useMemo(
    () => _.debounce(() => {
      if (!chartRef.current) return;
      const chart = echarts.getInstanceByDom(chartRef.current);
      chart?.resize();
    }, 300),
    []
  );
  const renderCustomNode: echarts.CustomSeriesRenderItem = useCallback((params, api) => {
    const point = api.coord([api.value(0), api.value(1)]);
    const marker = sortedTweetMarkers[params.dataIndex];

    if (!marker?.tweet_id || !point) return null;
    // if(marker.tweet_id)
    // 只在可视区域内渲染图片
    const isInViewport = (
      point[0] >= 0 &&
      point[0] <= (chartInstance.current?.getWidth() ?? 0) &&
      point[1] >= 0 &&
      point[1] <= (chartInstance.current?.getHeight() ?? 0)
    );

    if (!isInViewport) return null;

    return {
      type: 'image',
      style: {
        image: marker.profile_image_url || customAvatar,
        x: point[0] - 10,
        y: point[1] - 10,
        width: 20,
        height: 20,
        opacity: 1
      },
      transition: [],
      clipPath: {
        type: 'circle',
        shape: {
          cx: point[0],
          cy: point[1],
          r: 10
        }
      },
      enterFrom: {
        // 淡入
        style: { opacity: 0 },
      },

      silent: false
    };
  }, [sortedTweetMarkers])

  const option = useMemo<echarts.EChartsOption>(() => { 
    return {
      progressive: 200,  // 降低每帧渲染数量
      progressiveThreshold: 1000,  // 降低渐进渲染阈值

      throttle: 200,    // 增加节流阈值
      dataZoom: {
        show: false,
        start: defaultRange[0],
        end: defaultRange[1]
      },

      xAxis: {
        type: 'time',
        show: false,
        axisLine: {
          show: false,
          lineStyle: { color: '#333' }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: false
        }
      },
      yAxis: {
        show: false,
        type: 'value',
        axisLabel: {
          // show:false,
          color: '#666',
          formatter: (value: number) => value.toFixed(2)
        },
        splitLine: {
          show: false
        }
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'click',
        formatter: getTooltipFormatter,
        // extraCssText: 'padding: 0; background: transparent; max-width: none;',
        backgroundColor: 'rgba(45, 45, 79, 0.95)',
        borderWidth: 0,

        extraCssText: 'box-shadow: 0 0 10px rgba(0,0,0,0.3); border-radius: 8px;'
      },
      grid: {
        left: '6%',
        right: '3%',
        bottom: 20,
        top: '2%',
        // containLabel: false

      },
      series: [
        {
          type: 'graph',
          layout: 'none',
          coordinateSystem: 'cartesian2d',
          symbolSize: 20,
          label: {
            show: false
          },
          silent: true,
          data: sortedTweetMarkers.map(node => ({
            name: node.name,
            x: node.x,
            y: node.y,
            value: [node.x, node.y],
            symbolSize: 20,
            symbol: 'none'
            // symbol: `image://${node.profile_image_url}`
            // symbol: node.tweet_id ? 'circle' : 'none'
          })),
          links,
          // autoCurveness: true,

          lineStyle: {
            color: 'rgba(136, 132, 216, 0.5)',
            width: 2,
            opacity: 0.6,
            curveness: 0
          },
          edgeSymbolSize: [8, 8],
          animationDuration: 800,
          animationDelay: function (idx,) {
            return idx * itemDelay;
          },
          animationDelayUpdate: 0
        },
        {
          type: 'custom',
          renderItem: renderCustomNode,
          data: sortedTweetMarkers.map(node => ({
            name: node.name,
            x: node.x,
            y: node.y,
            value: [node.x, node.y],
            data: node
          })),
          tooltip: {
            show: true,
            trigger: 'item',
            enterable: true,
            confine: true,
            position: function (point) {
              return [point[0], point[1] + 20];
            }
          },

          animationDelay: function (idx,) {
            return idx * itemDelay;
          },
          animationDurationUpdate: 0,
          animationDelayUpdate: 0,
          universalTransition: {
            enabled: true
          }
        }
      ]
    }
  }, [renderCustomNode, sortedTweetMarkers, defaultRange])

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current);
    chartInstance.current.setOption(option);

    // 添加 resize 事件监听
    window.addEventListener('resize', debouncedResize);

    // 将 navigate 函数挂载到 window 对象上
    (window as any).reactNavigate = (path: string) => {
      navigate(path);
    };

    return () => {
      window.removeEventListener('resize', debouncedResize);
      debouncedResize.cancel();
      chartInstance.current?.dispose();
      // 清理
      delete (window as any).reactNavigate;
    };
  }, [sortedTweetMarkers, links, option, debouncedResize, navigate]);


  //   return  <ReactECharts
  //   ref={echartRef}
  //   option={getChartOption()}
  //   style={{ height: '100%' }}
  //   onEvents={{
  //     dataZoom: handleZoom
  //   }}
  // /> 
  return <div ref={chartRef} style={{ width: '100%', height: '600px', overflow: "hidden", }} />;
});
export default RelationChart;
