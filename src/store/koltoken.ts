import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { TokenList } from "@/utils/types";
interface koltokenState {
  kolsList: string[],
  tokenList: TokenList[]
}

const initialState: koltokenState = {
  kolsList: [],
  tokenList: []
}

const koltokenSlice = createSlice({
  name: "koltoken",
  initialState,
  reducers: {
    setKolsList(state, action: PayloadAction<string[]>) {
      state.kolsList = action.payload
    },
    setTokenList(state, action: PayloadAction<TokenList[]>) {
      state.tokenList = action.payload
    },
  },
})

export const { setKolsList,setTokenList } = koltokenSlice.actions

export default koltokenSlice.reducer
