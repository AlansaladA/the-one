import { useDispatch, useSelector } from 'react-redux';
import { setVisitorToken, clearToken, setWalletToken } from '../store/token';
import { StoreType } from '@/store';
import CryptoJS from 'crypto-js';

// AES 加密的密钥
const SECRET_KEY = 'your-secret-key-12345';
const FIXED_KEY = 'wyf';

interface EncryptPayload {
  timestamp: number;
  key: string;
}

export const useToken = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(
    (state: StoreType) => state.token
  );

  // AES加密函数
  const encryptPayload = (): string => {
    const payload: EncryptPayload = {
      timestamp: Date.now(),
      key: FIXED_KEY
    };
    
    return CryptoJS.AES.encrypt(JSON.stringify(payload), SECRET_KEY).toString();
  };

  const initToken = () => {
    const encryptedToken = encryptPayload();
    dispatch(setVisitorToken(encryptedToken));
  }

  const handleWalletConnect = (token: string) => {
    dispatch(setWalletToken(token));
  }

  const handleClearToken = () => {
    dispatch(clearToken());
  };
  
  return {
    token,
    handleWalletConnect,
    handleClearToken,
    initToken,
  };
}