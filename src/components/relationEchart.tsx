import { PriceHistory } from '@/utils/types';
import { Tweet } from '@/utils/types';
import * as echarts from 'echarts';
import { useRef, useEffect, useMemo } from 'react';

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

const RelationChart = ({ data, relation, tweets, range }: {
  tweets: Tweet[]
  data: PriceHistory[],
  relation: {
    data: Record<string, string[]>
    position: string
  }
  range: [number, number]
}) => {
  const position: Record<string, number> = useMemo(() => relation?.position ? JSON.parse(relation.position) : {}, [relation]);
  const timeRage = useMemo(() => {
    const times = data.sort((a, b) => a.time - b.time).map(item => item.time)

    return (
      {
        min: times[range[0]] ?? 0,
        max: times[range[1]] ?? 100
      }
    )
  }, [data, range])

  const sortedTweetMarkers = useMemo<CustomNode[]>(() => {
    if (!relation) return [];
    const relationData = relation.data || {};
    return tweets.map(tweet => {
      const tweetId = tweet.tweet_id;
      return {
        ...tweet,
        name: tweet.tweet_id,
        x: new Date(tweet.created_at).getTime(),
        relation: relationData[tweetId]?.filter(id => id !== tweetId) || [],
        y: position[tweetId] ?? 0
      };
    })
  }, [position, relation, tweets])

  const links = useMemo<CustomLink[]>(() => {
    const result: CustomLink[] = [];
    const processedPairs = new Set<string>();

    sortedTweetMarkers.forEach(tweet => {
      tweet.relation.forEach(targetId => {
        // 检查是否已经处理过这对关系
        const pairKey = [tweet.name, targetId].sort().join('-');
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);

        // 检查是否存在双向关系
        const target = sortedTweetMarkers.find(t => t.name === targetId);
        const isBidirectional = target?.relation.includes(tweet.name);
        
        // 添加调试日志
        // console.log('Relation:', {
        //   source: tweet.name,
        //   target: targetId,
        //   targetRelations: target?.relation,
        //   isBidirectional
        // });

        result.push({
          source: tweet.name,
          target: targetId,
          symbol: isBidirectional ? ['arrow', 'arrow'] : ['none', 'arrow']
        });
      });
    });
    
    console.log('Final links:', result);
    return result;
  }, [sortedTweetMarkers]);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  // 添加 resize 处理函数
  const handleResize = () => {
    if (chartInstance.current) {
      chartInstance.current.resize();
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);
    
    const option: echarts.EChartsOption = {
      progressive: 200,  // 降低每帧渲染数量
      progressiveThreshold: 1000,  // 降低渐进渲染阈值
      animation: false,  // 关闭全局动画以提升性能
      throttle: 200,    // 增加节流阈值

      xAxis: {
        type: 'time',
        show: false,
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
        show: false,
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
      tooltip: {
        trigger: 'item',
        enterable: true,
        confine: false,
        triggerOn: 'click',
        formatter: (params) => {
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
                  <div style="display: flex; gap: 8px;">
                    <button 
                      onclick="window.location.href='/detail/${node.screen_name}'"
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
                </div>
                <div style="margin-top: 8px; font-size: 14px; color: white;">
                  ${node.text}
                </div>
              </div>
            </div>
          `;
        },
        // extraCssText: 'padding: 0; background: transparent; max-width: none;',
        backgroundColor: 'rgba(45, 45, 79, 0.95)',
        borderWidth: 0,
        extraCssText: 'box-shadow: 0 0 10px rgba(0,0,0,0.3); border-radius: 8px;'
      },
      grid: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        containLabel: true,

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
          })),
          links,
          lineStyle: {
            color: 'rgba(136, 132, 216, 0.5)',
            width: 2,
            opacity: 0.6,
            curveness: 0.3,
          },
          edgeSymbolSize: [8, 8],
          animation: false
        },
        {
          type: 'custom',
          renderItem: (params, api) => {
            const point = api.coord([api.value(0), api.value(1)]);
            const marker = sortedTweetMarkers[params.dataIndexInside];
            
            if (!marker || !point) return null;
            
            // 只在可视区域内渲染图片
            const isInViewport = (
              point[0] >= 0 && 
              point[0] <= (chartInstance.current?.getWidth() ?? 0) && 
              point[1] >= 0 && 
              point[1] <= (chartInstance.current?.getHeight() ?? 0)
            );
            
            if (!isInViewport) return null;

            return {
              type: 'group',
              children: [{
                type: 'image',
                style: {
                  image: marker.profile_image_url || 'https://pbs.twimg.com/profile_images/1867692977734254592/j-GvEEZI_normal.jpg',
                  x: point[0] - 10,
                  y: point[1] - 10,
                  width: 20,
                  height: 20,
                  opacity: 1
                },
                emphasis: {
                  style: {
                    image: marker.profile_image_url || 'https://pbs.twimg.com/profile_images/1867692977734254592/j-GvEEZI_normal.jpg'
                  }
                },
                onerror: function(this: { style: { image: string } }) {
                  this.style.image = 'https://pbs.twimg.com/profile_images/1867692977734254592/j-GvEEZI_normal.jpg';
                },
                clipPath: {
                  type: 'circle',
                  shape: {
                    cx: point[0],
                    cy: point[1],
                    r: 10
                  }
                }
              }],
              silent: false
            };
          },
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
          }
        }
      ]
    };

    chartInstance.current.setOption(option);

    // 添加 resize 事件监听
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [sortedTweetMarkers, links]);

  // 当 range 改变时只更新显示范围
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.getInstanceByDom(chartRef.current);
    if (!chart) return;

    chart.setOption({
      xAxis: timeRage
    });
  }, [timeRage]);

  return <div ref={chartRef} style={{ width: '100%', height: '600px', overflow: "hidden", padding: "10px 40px 10px 40px" }} />;
};

export default RelationChart;
