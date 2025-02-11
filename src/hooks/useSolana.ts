import { solanaClusters } from "@/lib/consts/privyConfig"
import { Connection, PublicKey } from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  getAccount,
  getMint,
} from "@solana/spl-token"
function useSolana() {
  const connection = new Connection(
    process.env.NODE_ENV === "development"
      ? solanaClusters.devnet
      : solanaClusters["mainnet-beta"],
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
    const tokenMintAddress = new PublicKey(tokenAdress)
    const tokenAccountAddress = await getAssociatedTokenAddress(
      tokenMintAddress, // Token Mint
      walletAddress // Wallet Address
    )
    // 获取 Token Account 信息
    const accountInfo = await getAccount(connection, tokenAccountAddress)
    // 获取 Token 的 Mint 信息
    const mintInfo = await getMint(connection, tokenMintAddress)

    const readableBalance =
      accountInfo.amount / BigInt(Math.pow(10, mintInfo.decimals))
    return readableBalance.toString()
  }
  return { getBalance, getTokenBalance }
}

export default useSolana