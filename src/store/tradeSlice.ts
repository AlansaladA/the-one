import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TweetData, AddressData } from "@/utils/types";


interface koltokenState {
  tweet: TweetData | null,
  address: AddressData | null
}

const initialState: koltokenState = {
  tweet: null,
  address: null
}

const tradeSlice = createSlice({
  name: "trade",
  initialState,
  reducers: {
    setSocketData(state, action: PayloadAction<TweetData>) {
      state.tweet = action.payload
    },
    setAddressData(state, action: PayloadAction<AddressData>) {
      state.address = action.payload
    },
  },
});

export const { setSocketData, setAddressData } = tradeSlice.actions;
export default tradeSlice.reducer;