import { useStoreSelector, useStoreDispatch } from './useStore';
import { setTokenLevel } from '@/store/user';

const useTokenLevel = () => {
  const dispatch = useStoreDispatch();
  const { token_level } = useStoreSelector((state) => state.user);

   const updateTokenLevel = (newTokenLevel: string) => {
    dispatch(setTokenLevel(newTokenLevel));
  };

  return {
    token_level,
    updateTokenLevel,
  };
};

export default useTokenLevel;