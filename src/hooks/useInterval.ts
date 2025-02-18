import { useEffect, useRef } from "react"

/**
 * 自定义 Hook，用于设置定时器
 * @param callback 要执行的回调函数
 * @param delay 时间间隔(毫秒)，如果为 null 则暂停定时器
 * @param immediate 是否立即执行一次，默认为 false
 */
export function useInterval(
  callback: () => void | Promise<void>,
  delay: number | null,
  immediate: boolean = false
) {
  // 使用 useRef 保存回调函数，确保定时器始终使用最新的回调函数
  const savedCallback = useRef<() => void | Promise<void>>()

  // 记住最新的回调函数
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // 设置定时器
  useEffect(() => {
    // 如果 delay 为 null，则不启动定时器
    if (delay === null) return

    const tick = async () => {
      await savedCallback.current?.()
    }

    // 如果 immediate 为 true，立即执行一次
    if (immediate) {
      tick()
    }

    const id = setInterval(tick, delay)

    // 清理函数，组件卸载时清除定时器
    return () => clearInterval(id)
  }, [delay, immediate])
}
