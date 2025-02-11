import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios"
// import { BaseError } from "viem"
import store from '@/store' 
import { aesEncrypt } from './crypto.ts'

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
    // const token = store.getState().token.token
    
    // if(token){
    //   config.headers["Authorization"] = `tma ${token}`
    // }
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

// response interceptors
request.interceptors.response.use(
  (response) => {
    const res = response.data

    if (res.success === false) {
      return Promise.reject(Error(res.error || "request error"))
    }
    return res
  },
  (error) => {
    if (error.response.data) return Promise.reject(Error(error.response.data.message || "request error"))
    return Promise.reject(error)
  }
)

export default request
