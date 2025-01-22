import axios, { AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios"
// import { BaseError } from "viem"

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
    // if ("post" === config.method) {
    //   config.headers["Authorization"] = `tma ${initDataRaw}`
    // }
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
