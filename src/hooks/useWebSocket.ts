import { useEffect, useRef, useCallback } from "react"
import { TweetData, AddressData } from "@/utils/types"

type WSMessage = {
    data_type:"tweet",
    data:TweetData
} | {
    data_type:"account",
    data:AddressData
}


interface SubscriptionMessage {
  event: string
  data: {  
    channel: string
  }
}

interface PingMessage {
  event: "ping"
}

function getRandomJitter(baseDelay: number) {
  // 随机化延迟，返回 baseDelay 的 ±50% 范围内的随机值
  const jitter = Math.floor(Math.random() * baseDelay * 0.5)
  return Math.random() > 0.5 ? baseDelay + jitter : baseDelay - jitter
}

export const useWebSocket = (
  ca:string,
  onTradeUpdate?: (trade: any) => void,
  onTokenCreate?: (token: any) => void
) => {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null)
  const isConnecting = useRef(false)
  const isUnmounting = useRef(false)
  const lastConnectAttempt = useRef(0)
  const HEARTBEAT_INTERVAL = 30000 // 30 seconds
  const MIN_RECONNECT_DELAY = 5000 // 最小重连间隔5秒
  const maxAttempts = 10 // 最大重连次数
  const reconnectAttempts = useRef(0) // 重连次数

  const clearIntervals = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
      reconnectTimeout.current = null
    }
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
      heartbeatInterval.current = null
    }
  }

  const cleanup = () => {
    clearIntervals()
    if (ws.current) {
      ws.current.onclose = null // 移除onclose处理器，防止触发重连
      ws.current.onerror = null
      ws.current.onmessage = null
      ws.current.onopen = null
      ws.current.close(1000, "Cleanup")
      ws.current = null
    }
    isConnecting.current = false
  }

  const startHeartbeat = () => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current)
    }
    heartbeatInterval.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const pingMessage: PingMessage = { event: "ping" }
        ws.current.send(JSON.stringify(pingMessage))
      }
    }, HEARTBEAT_INTERVAL)
  }

  const subscribe = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      // const subscribeTransactions: SubscriptionMessage = {
      //   event: "subscribe",
      //   data: {
      //     channel: "new_tweet",
      //   },
      // }
      // const subscribeTokens: SubscriptionMessage = {
      //   event: "subscribe",
      //   data: {
      //     channel: "new_tokens",
      //   },
      // }
      // ws.current.send(JSON.stringify(subscribeTransactions))
      const subscribeTransactions = {
        token_address:ca,
      }
      
      setTimeout(() => {
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(subscribeTransactions))
        }
      }, 100)
    }
  }

  const connect = useCallback(() => {
    if (isUnmounting.current || isConnecting.current) {
      return
    }

    // 检查当前连接是否有效
    if (
      ws.current &&
      (ws.current.readyState === WebSocket.OPEN ||
        ws.current.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    const now = Date.now()
    const timeSinceLastAttempt = now - lastConnectAttempt.current
    if (timeSinceLastAttempt < MIN_RECONNECT_DELAY) {
      const delay = MIN_RECONNECT_DELAY - timeSinceLastAttempt
      reconnectTimeout.current = setTimeout(connect, delay)
      return
    }

    try {
      lastConnectAttempt.current = now
      isConnecting.current = true
      cleanup()

      const wsUrl = new URL(`${import.meta.env.VITE_WS_URL}`)
      ws.current = new WebSocket(wsUrl.toString())

      ws.current.onopen = () => {
        console.log("WebSocket connected")
        isConnecting.current = false
        subscribe()
        // startHeartbeat()
      }

      ws.current.onmessage = (event) => {
        try {
          if (event.data === "pong") {
            return
          }

          const message: WSMessage = JSON.parse(event.data)
          switch (message.data_type) {
            case "tweet": {
              const tradeData = message.data
              
              console.log(tradeData,'tradeData')
              onTradeUpdate?.(tradeData)
              break
            }
            case "account": {
              const addressData = message.data
              console.log(addressData,'addressData')
              onTokenCreate?.(addressData)
              break
            }
          }
        } catch (error) {
          console.error(
            "Error parsing WebSocket message:",
            error,
            "Raw data:",
            event.data
          )
        }
      }

      ws.current.onclose = (event) => {
        console.log("WebSocket closed with code:", event.code)
        isConnecting.current = false
        clearIntervals()

        // 只有在非正常关闭时才重连
        if (
          !isUnmounting.current &&
          event.code !== 1000 &&
          event.code !== 1001
        ) {
          // reconnectTimeout.current = setTimeout(connect, MIN_RECONNECT_DELAY)
          if (reconnectAttempts.current < maxAttempts) {
            reconnectAttempts.current++
            const delay = Math.min(
              MIN_RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current),
              40000
            ) // 指数回退
            const jitteredDelay = getRandomJitter(delay)
            console.log(`Reconnecting in ${jitteredDelay / 1000} seconds...`)

            reconnectTimeout.current = setTimeout(connect, jitteredDelay)
          } else {
            console.error("Max reconnect attempts reached.")
          }
        }
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        isConnecting.current = false
      }
    } catch (error) {
      console.error("Error creating WebSocket connection:", error)
      isConnecting.current = false
    }
  }, [onTradeUpdate,onTokenCreate])

  useEffect(() => {
    isUnmounting.current = false
    if(ca){
      connect()
    }
    return () => {
      isUnmounting.current = true
      cleanup()
    }

  }, [])

  return {
    ws: ws.current,
    reconnect: connect,
  }
}
