"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";

type BetterAuthUser = {
  createdAt?: Date;
  email?: string;
  emailVerified?: boolean;
  id?: string;
  image?: string | null;
  isAdmin?: boolean | null;
  name?: string;
  phonenumber?: string;
  twoFactorEnabled?: boolean | null;
  updatedAt?: Date;
};

type BetterAuthSession = {
  session?: Record<string, unknown>;
  user?: BetterAuthUser;
};

const BetterAuthSessionContext = createContext<{
  session: BetterAuthSession | null;
  loading: boolean;
} | null>(null);

export function BetterAuthSessionProvider({
  children,
  refetchInterval,
}: Readonly<{
  children: React.ReactNode;
  refetchInterval?: number;
}>) {
  const [session, setSession] = useState<BetterAuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    authClient.getSession().then(({ data }) => {
      if (!ignore) {
        setSession(data);
        setLoading(false);
      }
    });

    if (refetchInterval) {
      const interval = setInterval(() => {
        authClient.getSession().then(({ data }) => {
          if (!ignore) setSession(data);
        });
      }, refetchInterval * 1000);
      return () => {
        ignore = true;
        clearInterval(interval);
      };
    }
    return () => {
      ignore = true;
    };
  }, [refetchInterval]);

  const value = useMemo(() => ({ session, loading }), [session, loading]);

  return (
    <BetterAuthSessionContext.Provider value={value}>
      {children}
    </BetterAuthSessionContext.Provider>
  );
}

export function useBetterAuthSession() {
  return useContext(BetterAuthSessionContext);
}
