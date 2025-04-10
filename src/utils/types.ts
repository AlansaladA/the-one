export type Params = {
  kol: string
}

export type Follower = {
  common_count: number
  total_count: number
}

export type FollowTokens = {
  first_created_at: string
  pair_name_1: string
}

export type ChartData = {
  [key in FollowTokens["pair_name_1"]]: number | string
}

export type TokenList = {
  name: string
  address: string
  num: number,
  url:string
}

export type KolDetail = {
  FollowerNum: number
  Following: string
  profile_image_url: string
  user: string
}

export interface Tweet {
  created_at: string
  followers_count: number
  id: number
  impact: number
  pair_name_1: string
  profile_image_url: string
  // firestorage_image_url: string | null
  screen_name: string
  text: string
  tweet_id: string
  user: string
  relation?: string[]
}

export interface Price {
  price: number
  name: string
  volume: number
  time: number
}

export interface Ranks {
  avg_post_call_performance: number
  id: number
  kol: string
  name_1: string
  name_2: string
  name_3: string
  name_4: string
  peak_performance: number
  profile_id: string
  profile_link: string
  success_rate: number
  value_1: number
  value_2: number
  value_3: number
  value_4: number
}

export type TickerData = {
  ticker: string
  priceData: Price[]
  tweets: Tweet[]
  tweetsRelation: {
    data: Record<string, string[]>
    position: string
  }[]
  addressInfo: AddressInfo[]
}

export type KolData = {
  kol: string
}

export type KolGraphData = {
  data: {
    name: string
    symbolSize: number
    symbol: string
    relationship_status:string
  }[]
  links: {
    source: string
    target: string
    value: number
  }[]
}

export enum TokenLevel {
  BASIC = "basic",
  ADVANCED = "advanced"
}

export type AddressInfo = {
  acc_holder: string
  currency: string
  price: string
  signature: string
  signature_type:string,
  token_change:string,
  utc_time:string,
}

export type AddressRate = {
  new_users_count: number,
  price_change_20min:string,
  price_change_5min:string,
  target:string,
  total_buy_20min:string,
  total_buy_5min:string,
  total_investment:string,
  weighted_avg_holding_time_days:number
}


export type TweetData = {
  created_at:string,
  profile_image_url:string,
  screen_name:string,
  token_contract_address:string,
  token_name:string,
  user:string,
}

export type AddressData = {
  token_contract_address:string,
  token_name:string,
  acc_holder:string,
  price:number,
  token_change:number,
  signature:string,
  created_at:string,
}