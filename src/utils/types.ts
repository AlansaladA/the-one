export type Params = {
  kol: string;
};

export type Follower = {
  common_count: number,
  total_count: number
}

export type FollowTokens = {
  first_created_at: string,
  pair_name_1: string
}

export type ChartData = {
  [key in FollowTokens["pair_name_1"]]: number | string;
}


export type TokenList = {
  name: string,
  address: string,
  num: string
}

export type KolDetail = {
  FollowerNum:number,
  Following:string,
  profile_image_url:string,
  user:string
}

export interface Tweet {
  created_at: string;
  followers_count: number;
  id: number;
  impact: number;
  pair_name_1: string;
  profile_image_url: string;
  screen_name: string;
  text: string;
  tweet_id: number;
  user: string;
  relation?:string[]
}

export interface PriceHistory {
  close: string;
  download_time: string;
  name: string;
  volume: string;
}