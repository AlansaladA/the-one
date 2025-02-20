// 定义存储的key常量
export const STORAGE_KEY = {
  TOKEN: 'auth_token',
  WALLET_ADDRESS: 'wallet_address',
} as const

export const Storage = {
  // 获取 token
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY.TOKEN)
  },

  // 设置 token
  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEY.TOKEN, token)
  },

  // 删除 token
  removeToken(): void {
    localStorage.removeItem(STORAGE_KEY.TOKEN)
  },

  // 获取钱包地址
  getWalletAddress(): string | null {
    return localStorage.getItem(STORAGE_KEY.WALLET_ADDRESS)
  },

  // 设置钱包地址
  setWalletAddress(address: string): void {
    localStorage.setItem(STORAGE_KEY.WALLET_ADDRESS, address)
  },

  // 删除钱包地址
  removeWalletAddress(): void {
    localStorage.removeItem(STORAGE_KEY.WALLET_ADDRESS)
  },

  // 清除所有存储
  clear(): void {
    localStorage.clear()
  }
}

export default Storage