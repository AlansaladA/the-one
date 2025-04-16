import { useAuthModal, useUser, useLogout } from "@account-kit/react";
import { usePrivy } from "@privy-io/react-auth"
import { useState } from "react";

export default function useWalletManager() {
  const [activeWallet, setActiveWallet] = useState<'alchemy' | 'solana' | null>(null);
   
  // Alchemy依赖
  const { openAuthModal } = useAuthModal();
  const user = useUser();
  const { logout: logoutAlchemy } = useLogout();
  
  // Solana依赖
  const { ready, authenticated, login, logout, user:privyUser } = usePrivy()


  const connectWallet = async (type: 'alchemy' | 'solana') => {
    try {
      if (type === 'alchemy') {
        await openAuthModal();
        setActiveWallet('alchemy');
      } else {
        await login();
        setActiveWallet('solana');
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  }

  const disconnectWallet = async () => {
    if (activeWallet === 'alchemy') {
      await logoutAlchemy();
    } else  {
      await logout();
    }
    setActiveWallet(null);
  };

  const getAddress = () => {
    if (activeWallet === 'alchemy') {
      return user?.address;
    // } else if (activeWallet === 'solana') {
    } else {
      return privyUser?.wallet?.address;
    }
  }

  const getBalance = () => {
    if (activeWallet === 'solana') {
      return 1000
    }
    return null;
  };

  return {
    activeWallet,
    connectWallet,
    disconnectWallet,
    getAddress,
    getBalance,
    isConnected: !!getAddress(),
  };
};