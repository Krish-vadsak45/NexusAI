// Server component used by Next.js app router during loading states
import React from "react";
import { Loading } from "@/components/Loading";

export default function AppLoading() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <Loading />
    </div>
  );
}
