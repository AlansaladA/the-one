import React, { useEffect, useRef,useState } from 'react';
import { DataSet, Network } from 'vis-network/standalone';
import { _data } from '@/utils/mockdata';
import { Tweet } from '@/utils/types';

const Relation = ({ relationData }:{relationData:Tweet[]}) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const [network,setNetwork] = useState<any>({})
  const [nodes, setNodes] = useState<any>(null);

  const [tooltipContent, setTooltipContent] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!networkRef.current) return;
    const containerWidth = networkRef.current.clientWidth;
    // 获取最早和最晚的时间戳
    const timestamps = _data.tweets.map((tweet) => new Date(tweet.created_at).getTime());
    const minTimestamp = Math.min(...timestamps);
    const maxTimestamp = Math.max(...timestamps);

    // 准备节点数据，按时间排序
    const nodes = new DataSet(
      relationData
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map((tweet, index) => {
          const entryTimestamp = new Date(tweet.created_at).getTime();
          const xPercentage = (entryTimestamp - minTimestamp) / (maxTimestamp - minTimestamp);
          const x = containerWidth * (0.1 + xPercentage * 0.8); // 留出10%的边距
          
          return {
            id: tweet.id,
            title: "",
            image: tweet.profile_image_url,
            shape: 'circularImage',
            text: tweet.text,
            size: 40,
            x: String(x),
            y: String(500 + Math.sin(index) * 1300)
          };
        })
    );
    setNodes(nodes);

    // y: 100 + Math.sin(index) * 400,
    // 准备边数据
    const edges = new DataSet(
      // relationData.flatMap((tweet) =>
        // tweet.relations.map((relation) => ({
        //   from: tweet.id,
        //   to: relation.targetId,
        //   // label: relation.type,
        //   arrows: 'to',
        //   color: { color: '#49497D', highlight: '#49497D', hover: 'red' },
        // })
      //  )
      // )
    )

    // 初始化网络
    const container = networkRef.current;
    const options = {
      autoResize: true,
      height: '100%',
      width: '100%',
      nodes: {
        shape: 'dot',
        size: 40,
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
          y:true
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

    const network = new Network(container, { nodes,edges },  options);
    network.fit()
    network.on("selectNode",(params)=>{
      console.log(params);
      
    })
    network.on("hoverNode",(params)=>{
      hoverFun(params)
    })
    setNetwork(network)
  }, [relationData]);

  const clickNode = () =>{
    
  }

  const hoverFun = (params:any) =>{
    if (params.node) {
      const nodeId = params.node;
      const node = nodes.get(nodeId);
      const pointer = network.getPositions([nodeId])[nodeId];
      const domPosition = network.canvasToDOM(pointer);
      console.log(node,'node');
      
      setTooltipContent(node);
      setTooltipPosition({
        x: domPosition.x,
        y: domPosition.y,
      });
    } else {
      setTooltipContent(null);
    }
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
  {/* {tooltipContent && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y + 10,
            backgroundColor: 'white',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxWidth: '300px',
            border: '1px solid #eee'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <img 
              src={tooltipContent.image} 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '10px'
              }}
              alt="profile"
            />
            <div>
              <div style={{ fontWeight: 'bold' }}>{tooltipContent.screen_name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {new Date(tooltipContent.created_at).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
            {tooltipContent.text}
          </div>
        </div>
      )} */}
</div>
}

export default Relation;