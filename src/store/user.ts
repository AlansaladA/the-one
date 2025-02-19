import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TokenState {
  token: string | null;
  token_level:string
}

const initialState: TokenState = {
  token: localStorage.getItem('auth_token'),
  token_level:""
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('auth_token', action.payload);
    },
    clearToken: (state) => {
      state.token = null;
      localStorage.removeItem('auth_token');
    },
    setTokenLevel: (state, action: PayloadAction<string>) => {
      state.token_level = action.payload;
    },
  },
});

export const { setToken, clearToken, setTokenLevel } = tokenSlice.actions;
export default tokenSlice.reducer;