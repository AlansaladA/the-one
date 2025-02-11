import { useMemo } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useStoreDispatch, useStoreSelector } from "./useStore"
import { setBalance } from "@/store/wallet"

const useWallet = () => {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const wallet = useStoreSelector((state) => state.wallet)
  const dispatch = useStoreDispatch()

  const isLogined = useMemo(
    () => ready && authenticated,
    [authenticated, ready]
  )

  const updateTokenBalance = (newBalance: number) => {
    dispatch(setBalance(newBalance))
  }

  return {
    ...wallet,
    isLogined,
    address: user?.wallet?.address,
    login,
    logout,
    updateTokenBalance,
  }
}

export default useWallet