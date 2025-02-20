import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TokenState {
  token_level:string
}

const initialState: TokenState = {
  token_level:"basic"
};

const tokenSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {

    setTokenLevel: (state, action: PayloadAction<string>) => {
      state.token_level = action.payload;
    },
  },
});

export const {  setTokenLevel } = tokenSlice.actions;
export default tokenSlice.reducer;