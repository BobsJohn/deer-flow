import { AuthProvider } from "@/components/marketplace/auth-context";

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
