import { solanaClusters } from "@/lib/consts/privyConfig"
import { Connection, PublicKey } from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  getAccount,
  getMint,
} from "@solana/spl-token"
import { TOKEN_DECIMALS } from "@/lib/consts"
function useSolana() {
  const connection = new Connection(
    "https://ancient-small-liquid.solana-mainnet.quiknode.pro/26deb9b7822ea39cad4c4c72f0980651a924c955",
    // solanaClusters["mainnet-beta"],
    // process.env.NODE_ENV === "development"
    //   ? solanaClusters.devnet
    //   : solanaClusters["mainnet-beta"],
    "confirmed"
  )
  const getBalance = async (address: string) => {
    const walletAddress = new PublicKey(address)
    try {
      const balance = await connection.getBalance(walletAddress)
      return balance
    } catch (err) {
      console.error("获取余额失败:", err)
      return 0
    }
  }

  const getTokenBalance = async (address: string, tokenAdress: string) => {
    const walletAddress = new PublicKey(address)
    // 用户的 Token Account 地址
    const tokenKey = new PublicKey(tokenAdress)
    const tokenAccountKey = await getAssociatedTokenAddress(
      tokenKey, // Token
      walletAddress // Wallet Address
    )
    // 获取 Token Account 信息
    const accountInfo = await getAccount(connection, tokenAccountKey)
    const readableBalance =
      accountInfo.amount / BigInt(Math.pow(10, TOKEN_DECIMALS))
    return readableBalance.toString()
  }
  return { getBalance, getTokenBalance }
}

export default useSolana
