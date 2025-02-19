import { configureStore } from "@reduxjs/toolkit"
import walletReducer from "./wallet"
import koltokenSlice from "./koltoken"
import userSlice from "./user"

const store = configureStore({
  reducer: {
    wallet: walletReducer,
    koltoken: koltokenSlice,
    user: userSlice
  },
})

export type StoreType = ReturnType<typeof store.getState>
export type StoreDispatch = typeof store.dispatch

export default store
