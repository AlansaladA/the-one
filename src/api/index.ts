import request from "@/utils/request";

export const getTickers = async () => {
  return await request<{
    tickers: Array<string[]>;
  }>({
    url: "/get-tickers",
    method: "get",
  });
};

export const getKols = async () => {
  return await request<{
    tickers: Array<string>;
  }>({
    url: "/get-kols",
    method: "get",
  });
};

export const getTickerOne = async (tickerName: string) => {
  return await request<{
    history: Array<{
      close: string;
      download_time: string;
      name: string;
      volume: string;
    }>;
    ticker_name: string;
  }>({
    url: `/get-ticker-history?ticker_name=${tickerName}`,
    method: "get",
  });
};

export const getTweetOne = async (tickerName: string) => {
  return await request<{
    ticker_name: string;
    tweets: Array<{
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
    }>;
  }>({
    url: `/get-ticker-tweet?ticker_name=${tickerName}`,
    method: "get",
  });
};

export const getKolOne = async (kolName: string) => {
  return await request({
    url: `/get-following?kol_name=${kolName}`,
    method: "get",
  });
};

export const getFollowNum = async (kolName: string) => {
  return await request<{
    ticker_name: string;
    ["following data"]: Array<{
      common_count: number;
      total_count: number;
    }>;
  }>({
    url: `/get-following-num?kol_name=${kolName}`,
    method: "get",
  });
};

export const getFollowList = async (kolName: string) => {
  return await request<{
    ticker_name: string;
    tweets: Array<{
      FollowerNum: number;
      Following: string;
      profile_image_url: string;
      user: string;
    }>;
  }>({
    url: `/get-following-list?kol_name=${kolName}`,
    method: "get",
  });
};

export const getFollowTime = async (kolName: string) => {
  return await request<{
    ticker_name: string;
    tweets: Array<{
      first_created_at: string;
      pair_name_1: string;
    }>;
  }>({
    url: `/get-kol-asset?kol_name=${kolName}`,
    method: "get",
  });
};
