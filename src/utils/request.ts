import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios"
import { fetchLogin } from "@/api"
import { aesEncrypt } from './crypto.ts'
import { Storage } from './storage'

interface CustomAxiosInstance extends AxiosInstance {
  <T = any, R = AxiosResponse<T>, D = any>(
    config: AxiosRequestConfig<D>
  ): Promise<T>
  post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>
  ): Promise<T>
}
const request: CustomAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 50000,
})

// request interceptors
request.interceptors.request.use(
  (config) => {
    // const token = store.getState().user.token
    const token = Storage.getToken()
    if(token){
      config.headers["Authorization"] = `Bearer ${token}`
    }
    // 获取当前UTC时间戳
    const timestamp = Math.floor(Date.now() / 1000).toString(); 
    // 加密时间戳
    const encryptedTimestamp = aesEncrypt(timestamp);

    // 添加到请求头
    config.headers['X-Timestamp'] = encryptedTimestamp;
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

let isRefreshing = false; // 添加一个标识，用于判断是否正在刷新token
let requests: Function[] = []; // 存储待重试的请求

// response interceptors
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.success === false) {
      return Promise.reject(Error(res.error || "request error"))
    }
    return res
  },
  async (error) => {
    if (error.response?.status === 403 && error.response?.data?.error === "Token has expired") {
      const config = error.config;
      
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const address = Storage.getWalletAddress()
          if (address) {
            const { token } = await fetchLogin(address)
            Storage.setToken(token)
            // 更新原始请求的header
            config.headers.Authorization = `Bearer ${token}`
            // 重试所有等待的请求
            requests.forEach(cb => cb(token));
            requests = [];
            return request(config)
          }
        } catch (refreshError) {
          requests.forEach(cb => cb(null));
          requests = [];
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false;
        }
      } else {
        // 将请求加入队列
        return new Promise((resolve) => {
          requests.push((token: string) => {
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
              resolve(request(config));
            } else {
              resolve(Promise.reject(error));
            }
          });
        });
      }
    }
    
    if (error.response?.data) {
      return Promise.reject(Error(error.response.data.message || "request error"))
    }
    return Promise.reject(error)
  }
)

export default request
