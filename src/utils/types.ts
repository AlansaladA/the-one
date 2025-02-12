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
  num: number
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
  tweet_id: string;
  user: string;
  relation?:string[]
}

export interface Price {
  price: number; 
  name: string;
  volume: number;
  time: number;
}

export interface Ranks {
  avg_post_call_performance: number;
  id: number;
  kol:string,
  name_1:string,
  name_2:string,
  name_3:string,
  name_4:string,
  peak_performance:number,
  profile_id:string,
  profile_link:string,
  success_rate:number,
  value_1:number,
  value_2:number,
  value_3:number,
  value_4:number
}