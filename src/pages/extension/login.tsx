"use client"
import { usePrivy } from "@privy-io/react-auth"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "react-router"
import React, { useEffect } from "react"

export default function Page() {
  const { ready, authenticated, login, logout, user } = usePrivy()
  const [searchParams] = useSearchParams();

  // Handle login success
  React.useEffect(() => {
    if (authenticated && user?.wallet) {
      window.dispatchEvent(new CustomEvent('plugin-login', {
        detail: { address: user.wallet.address }
      }));
      const returnUrl = searchParams.get("returnTo")
      window.location.replace(returnUrl || window.location.origin)
    }
  }, [authenticated, searchParams, user]);

  return (
    <div className="flex min-h-screen items-center justify-center">

      <Button
        onClick={() => login()}
        disabled={!ready}
        className="px-6 py-2"
      >
        {ready ? authenticated ? user?.wallet?.address || '' : 'Login with Wallet' : 'Loading...'}
      </Button>
    </div>
  )
}