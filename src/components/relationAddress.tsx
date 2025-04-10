// import { Tweet } from '@/utils/types';
import * as echarts from 'echarts';
import _ from 'lodash';
import dayjs from 'dayjs';
import ReactECharts from 'echarts-for-react';
import { useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router';
import { CUSTOM_AVATAR } from '@/lib/consts';

interface CustomNode {
  x: number;
  y: number | undefined;
  color?: string;
  name: string,
  address: string,  // 钱包地址
  created_at: string,
  position_size: number,  // 持仓量
  transaction_type: 'buy' | 'sell',  // 交易类型
  amount: number,  // 交易金额
  relation: string[];  // 添加这个属性
  // ... 其他必要字段 ...
}

interface CustomLink {
  source: string;
  target: string;
  symbol?: [string, string];  // 添加可选的 symbol 属性
}

interface Tweet {
  id: number;
  tweet_id: string;      // 添加这个属性
  address: string;           // 钱包地址
  created_at: string;        // 交易时间
  position_size: number;     // 持仓量
  transaction_type: 'buy' | 'sell';  // 交易类型
  amount: number;            // 交易金额
  related_addresses?: string[];  // 相关联的钱包地址
}

const itemDelay = 2
const getTooltipFormatter = (params) => {
  const { data: node } = params.data;
  return `
    <div style="max-height: 300px; padding: 16px; display: flex; flex-direction: column; gap: 16px; background: #2D2D4FF2; border-radius: 8px; color: #CBD5E0; width: 400px;">
      <div style="border-color: #2D2D4F;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; flex-direction: column;">
            <div style="font-size: 14px; font-weight: bold; color: white;">
              ${node.address.slice(0, 6)}...${node.address.slice(-4)}
            </div>
            <div style="font-size: 14px; color: #A0AEC0;">
              持仓量: ${node.position_size.toLocaleString()}
            </div>
          </div>
          <div style="color: ${node.transaction_type === 'buy' ? '#4CAF50' : '#FF5252'};">
            ${node.transaction_type === 'buy' ? '买入' : '卖出'}
          </div>
        </div>
        <div style="margin-top: 8px; font-size: 14px; color: white;">
          交易金额: ${node.amount.toLocaleString()} USDT
        </div>
        <div style="font-size: 12px; color: #A0AEC0; margin-top: 4px;">
          ${dayjs(node.created_at).format('YYYY-MM-DD HH:mm')}
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
    // console.log(position, 'position');
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
          created_at: new Date(timePoint.time).toISOString(),
          position_size: 0,
          transaction_type: 'buy' as const,
          amount: 0,
          address: '',
          id: 0,
          tweet_id: `empty-${timePoint.time}`
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
          y: positionMap.get(tweetId) ?? undefined,
          position_size: item.position_size,
          transaction_type: item.transaction_type,
          amount: item.amount,
          address: item.address,
          id: item.id,
          tweet_id: item.tweet_id
        });
      });
    });
    console.log(markers, 'markers');
    
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

    if (!marker?.address || !point) return null;

    const isInViewport = (
      point[0] >= 0 &&
      point[0] <= (chartInstance.current?.getWidth() ?? 0) &&
      point[1] >= 0 &&
      point[1] <= (chartInstance.current?.getHeight() ?? 0)
    );

    if (!isInViewport) return null;

    // 计算所有持仓量的最大值和最小值
    const maxPosition = Math.max(...sortedTweetMarkers.map(m => m.position_size));
    const minPosition = Math.min(...sortedTweetMarkers.map(m => m.position_size));
    
    // 计算当前持仓量的百分比 (使用线性插值)
    const percentage = (marker.position_size - minPosition) / (maxPosition - minPosition);
    
    // 根据百分比计算圆的大小，设置最小半径为 5，最大半径为 20
    const radius = 5 + percentage * 15;
    const color = marker.transaction_type === 'buy' ? '#4CAF50' : '#FF5252';

    return {
      type: 'circle',
      shape: {
        cx: point[0],
        cy: point[1],
        r: radius
      },
      style: {
        fill: color,
        opacity: 0.8
      },
      transition: ['shape', 'style'],
      // enterFrom: {
      //   style: { opacity: 0 }
      // },
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
        top: '5%',
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
