"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(() => import("@/components/custom-cursor"), {
  ssr: false,
});

export default function LazyCustomCursor() {
  return <CustomCursor />;
}
