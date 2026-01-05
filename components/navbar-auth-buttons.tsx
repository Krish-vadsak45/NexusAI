"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AuthButtons() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    async function fetchSession() {
      setLoading(true);
      try {
        const { data } = await authClient.getSession();
        if (!ignore) setSession(data);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchSession();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    setSession(null);
    router.refresh(); // ensures server components revalidate if needed
    router.push("/auth/signin");
  };

  if (loading) return null;

  if (session) {
    return (
      <>
        <li>
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Dashboards
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            className="hover:text-foreground transition-colors"
          >
            Profile
          </Link>
        </li>
        <li>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={handleSignOut}
          >
            Sign out
          </Button>
        </li>
      </>
    );
  }

  return (
    <>
      <li>
        <Link
          href="/auth/signin"
          className="hover:text-blue-400 transition-colors"
        >
          Sign In
        </Link>
      </li>
      <li>
        <Link
          href="/auth/signup"
          className="hover:text-blue-400 transition-colors"
        >
          Sign Up
        </Link>
      </li>
    </>
  );
}
