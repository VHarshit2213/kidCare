import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import { useAuth } from "@/hooks/use-auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 relative z-0 overflow-y-auto bg-neutral-lighter">
        {children}
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
