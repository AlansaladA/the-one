import { configureStore } from "@reduxjs/toolkit"
import walletReducer from "./wallet"
import koltokenSlice from "./kolToken"

const store = configureStore({
  reducer: {
    wallet: walletReducer,
    koltoken: koltokenSlice
  },
})

export type StoreType = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch

export default store
