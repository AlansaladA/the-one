import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface WalletState {
  balance: number
}

const initialState: WalletState = {
  balance: 0,
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setBalance(state, action: PayloadAction<number>) {
      state.balance = action.payload
    },
    resetWallet(state) {
      state.balance = 0
    },
  },
})

export const { setBalance, resetWallet } = walletSlice.actions

export default walletSlice.reducer
