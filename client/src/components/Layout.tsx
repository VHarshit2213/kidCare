import { useContext } from "react";
import { AppContext } from "@/App";
import Header from "./Header";
import MobileNav from "./MobileNav";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useContext(AppContext);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 relative z-0 overflow-y-auto pb-20 sm:pb-0 bg-neutral-lighter">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
