import { configureStore } from "@reduxjs/toolkit"
import walletReducer from "./wallet"

const store = configureStore({
  reducer: {
    wallet: walletReducer,
  },
})

export type StoreType = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch

export default store
