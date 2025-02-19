import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios"
import { fetchLogin } from "@/api"
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
    const token = store.getState().user.token
    
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
    
    // 处理403错误，重新获取token
    // if (error.response?.status === 403) {
    //   try {
    //     // 从localStorage获取当前钱包地址
    //     const address = localStorage.getItem('walletAddress')
    //     if (address) {
    //       const { token } = await fetchLogin(address)
    //       // 更新localStorage中的token
    //       localStorage.setItem('token', token)
    //       // 更新原始请求的header
    //       error.config.headers.Authorization = `Bearer ${token}`
    //       // 重试原始请求
    //       return request(error.config)
    //     }
    //   } catch (refreshError) {
    //     return Promise.reject(refreshError)
    //   }
    // }
    
    if (error.response?.data) {
      return Promise.reject(Error(error.response.data.message || "request error"))
    }
    return Promise.reject(error)
  }
)

export default request
