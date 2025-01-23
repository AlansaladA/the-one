
import React, { useEffect, useRef,useState } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import { _data } from '@/utils/mockdata';
import { Tweet } from '@/utils/types';

const Relation = ({ relationData }:{relationData:Tweet[]}) => {
  const networkRef = useRef(null);
  const [network,setNetwork] = useState<any>({})

  useEffect(()=>{
    
  },[relationData])

  useEffect(() => {
    if (!networkRef.current) return;
    // 获取最早和最晚的时间戳
    const timestamps = _data.tweets.map((tweet) => new Date(tweet.created_at).getTime());
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);

    // 准备节点数据，按时间排序
    const nodes = new DataSet(
      _data.tweets
        // .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // 按时间排序
        .map((tweet, index) => {
          const entryTimestamp = new Date(tweet.created_at).getTime();
          const xPercentage = (entryTimestamp - minTimestamp) / (maxTimestamp - minTimestamp);
          const x = xPercentage * 1000; // 计算横向坐标

          return {
            id: tweet.id,
            label: tweet.screen_name,
            title: tweet.text,
            image: tweet.avatar,
            shape: 'circularImage',
            size: 10,
            x: x, // 设置横坐标
            y: 100 + Math.sin(index) * 100, // 使用 sin 来让节点有轻微的波动，避免重叠
          };
        })
    );

    // 准备边数据
    const edges = new DataSet(
      _data.tweets.flatMap((tweet) =>
        tweet.relations.map((relation) => ({
          from: tweet.id,
          to: relation.targetId,
          // label: relation.type,
          arrows: 'to',
          color: { color: '#49497D', highlight: '#49497D', hover: 'red' },
        }))
      )
    );

    // 初始化网络
    const container = networkRef.current;
    const options = {
      autoResize: true,
      height: '100%',
      width: '100%',
      nodes: {
        shape: 'dot',
        size: 16,
        font: {
          size: 16,
          color: '#fff',
        },
        borderWidth: 2,
        borderWidthSelected: 4,
        color: {
          border: '#2B7CE9',
          background: '#97C2FC',
          highlight: {
            border: '#2B7CE9',
            background: '#D2E5FF'
          },
          hover: {
            border: '#2B7CE9',
            background: '#D2E5FF'
          }
        },
        fixed: {
          x:true,
          y:false
        }
      },  
      edges: {
        width: 1,
        // color: { color: 'red', highlight: '#fff', hover: '#fff' },
        smooth: { type: 'continuous', enabled: true,roundness: 0.5, },
        arrows: { to: { enabled: true, scaleFactor: 0 } },
        dashes: true,
      },
      physics: {
        enabled: false, // 禁用物理引擎以避免自动布局影响
      },
      interaction:{hover:true},
      layout: {
        randomSeed: 1, // 防止布局乱跳
        improvedLayout: false, // 禁用改进布局，确保按x、y坐标位置固定
      },
    };

    const network = new Network(container, { nodes, edges }, options);
    network.on("selectNode",(params)=>{
      console.log(params);
      
    })
    // network.on("hoverNode",(params)=>{
    //   hoverFun(params)
    // })
    setNetwork(network)
  }, [_data]);

  const clickNode = () =>{
    
  }


  useEffect(() => {
    const clickNode = () =>{
      console.log("oioioi");
      
    }
    if(network){
      // network.on("click",clickNode)
    }
  }, [network]);



  return   <div style={{ position: 'relative' }}>
  <div ref={networkRef} style={{ width: '100%', height: '600px' }} />
</div>
}

export default Relation;