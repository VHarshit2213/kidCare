import { createContext, useContext, useMemo, useState } from "react";

type BadgeCounts = {
  unreadCount: number;
  bookingUnreadCount: number;
  playGreetUnreadCount: number;
  setUnreadCount: (count: number) => void;
  setBookingUnreadCount: (count: number) => void;
  setPlayGreetUnreadCount: (count: number) => void;
  resetCounts: () => void;
};

const BadgeContext = createContext<BadgeCounts | null>(null);

export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [bookingUnreadCount, setBookingUnreadCount] = useState(0);
  const [playGreetUnreadCount, setPlayGreetUnreadCount] = useState(0);

  const value = useMemo(
    () => ({
      unreadCount,
      bookingUnreadCount,
      playGreetUnreadCount,
      setUnreadCount,
      setBookingUnreadCount,
      setPlayGreetUnreadCount,
      resetCounts: () => {
        setUnreadCount(0);
        setBookingUnreadCount(0);
        setPlayGreetUnreadCount(0);
      },
    }),
    [unreadCount, bookingUnreadCount, playGreetUnreadCount]
  );

  return <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>;
}

export function useBadgeCounts() {
  const ctx = useContext(BadgeContext);
  if (!ctx) {
    throw new Error("useBadgeCounts must be used within BadgeProvider");
  }
  return ctx;
}
