"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

const BetterAuthSessionContext = createContext<any>(null);

export function BetterAuthSessionProvider({
  children,
  refetchInterval,
}: Readonly<{
  children: React.ReactNode;
  refetchInterval?: number;
}>) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    authClient.getSession().then(setSession);
    if (refetchInterval) {
      const interval = setInterval(() => {
        authClient.getSession().then(setSession);
      }, refetchInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refetchInterval]);

  return (
    <BetterAuthSessionContext.Provider value={session}>
      {children}
    </BetterAuthSessionContext.Provider>
  );
}

export function useBetterAuthSession() {
  return useContext(BetterAuthSessionContext);
}
