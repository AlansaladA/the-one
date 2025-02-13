import { getTweetOne, getTickerOne, getRelation } from "@/api"
import { TickerData } from "@/utils/types"
import { LoaderFunction } from "react-router"

export const tickerLoader: LoaderFunction = async ({ params }) => {
  const { ticker } = params
  if (!ticker) {
    throw new Error("Token not found")
  }
  const [priceRes, tweetsRes, tweetsRelation] = await Promise.all([
    getTickerOne(ticker),
    getTweetOne(ticker),
    getRelation(ticker),
  ])

  return {
    ticker,
    priceData: priceRes.history.map((item) => ({
      time: new Date(item.download_time).getTime(),
      price: parseFloat(item.close),
      volume: parseFloat(item.volume),
      name: item.name,
    })), // 根据接口返回的结构调整
    tweets: tweetsRes.tweets.filter(
      (tweet) =>
        new Date(tweet.created_at).getTime() >=
        new Date(priceRes.history[0].download_time).getTime()
    ),
    tweetsRelation: tweetsRelation.tweets,
  } satisfies TickerData
}
