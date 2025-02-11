import { configureStore } from "@reduxjs/toolkit"
import walletReducer from "./wallet"
import koltokenSlice from "./koltoken"
import tokenSlice from "./token"

const store = configureStore({
  reducer: {
    wallet: walletReducer,
    koltoken: koltokenSlice,
    token: tokenSlice
  },
})

export type StoreType = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch

export default store
