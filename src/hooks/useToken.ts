import { useStoreSelector, useStoreDispatch } from './useStore';
import { setToken, clearToken, setTokenLevel } from '@/store/user';

const useToken = () => {
  const dispatch = useStoreDispatch();
  const { token_level } = useStoreSelector((state) => state.user);
  const updateToken = (newToken: string) => {
    dispatch(setToken(newToken));
  };

  const removeToken = () => {
    dispatch(clearToken());
  };

   const updateTokenLevel = (newTokenLevel: string) => {
    dispatch(setTokenLevel(newTokenLevel));
  };

  return {
    token_level,
    updateToken,
    removeToken,
    updateTokenLevel,
  };
};

export default useToken;