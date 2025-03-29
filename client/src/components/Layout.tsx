import { useContext } from "react";
import { AppContext } from "@/App";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useContext(AppContext);

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
