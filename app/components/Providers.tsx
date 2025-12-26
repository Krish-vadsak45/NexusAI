import { ImageKitProvider } from "@imagekit/next";
import { BetterAuthSessionProvider } from "./BetterAuthSessionProvider";

const urlEndPoint = process.env.NEXT_PUBLIC_URL_ENDPOINT!;

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BetterAuthSessionProvider refetchInterval={5 * 60}>
      <ImageKitProvider urlEndpoint={urlEndPoint}>{children}</ImageKitProvider>
    </BetterAuthSessionProvider>
  );
}
