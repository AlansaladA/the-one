import { createSlice } from '@reduxjs/toolkit';


export interface TokenState {
  token: string | null;
}

const initialState: TokenState = {
  token: null,
};


const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    // 生成访客 token
    setVisitorToken: (state, action) => { 
      state.token = action.payload;
    },
    // 设置钱包连接 token
    setWalletToken: (state, action) => {
      state.token = action.payload;
    },
    // 清除 token
    clearToken: (state) => {
      state.token = null;
    },
  },
});

export const { setVisitorToken, setWalletToken, clearToken } = tokenSlice.actions;
export default tokenSlice.reducer;