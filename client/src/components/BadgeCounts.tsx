import { useCallback, useEffect } from "react";
import supabase from "@/config/supabaseClient";
import { useAuth } from "@/hooks/use-auth";
import { useBadgeCounts } from "@/contexts/badge-context";

export default function BadgeCounts() {
  const { user } = useAuth();
  const userId = user?.id;
  const isAdmin = user?.user_metadata?.userType === "admin";
  const { setUnreadCount, setBookingUnreadCount, setPlayGreetUnreadCount, resetCounts } =
    useBadgeCounts();

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching unread messages:", error.message);
      setUnreadCount(0);
      return;
    }

    setUnreadCount(count ?? 0);
  }, [userId, setUnreadCount]);

  const fetchPlayGreetUnreadCount = useCallback(async () => {
    if (!userId) {
      setPlayGreetUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("playAndGreet")
      .select("id", { count: "exact", head: true })
      .or(
        `and(parent_id.eq.${userId},parent_is_read.eq.false),and(sitter_id.eq.${userId},sitter_is_read.eq.false)`
      );

    if (error) {
      console.error("Error fetching unread play & greet:", error.message);
      setPlayGreetUnreadCount(0);
      return;
    }

    setPlayGreetUnreadCount(count ?? 0);
  }, [userId, setPlayGreetUnreadCount]);

  const fetchBookingUnreadCount = useCallback(async () => {
    if (!userId) {
      setBookingUnreadCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("bookingNotification")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching unread booking notifications:", error.message);
      setBookingUnreadCount(0);
      return;
    }

    setBookingUnreadCount(count ?? 0);
  }, [userId, setBookingUnreadCount]);

  useEffect(() => {
    if (!userId || isAdmin) {
      resetCounts();
    }
  }, [userId, isAdmin, resetCounts]);

  useEffect(() => {
    if (!userId || isAdmin) return;

    fetchUnreadCount();

    const channel = supabase
      .channel(`messages-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isAdmin, fetchUnreadCount]);

  useEffect(() => {
    if (!userId || isAdmin) return;

    fetchBookingUnreadCount();

    const channel = supabase
      .channel(`booking-notification-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookingNotification",
          filter: `receiver_id=eq.${userId}`,
        },
        () => fetchBookingUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isAdmin, fetchBookingUnreadCount]);

  useEffect(() => {
    if (!userId || isAdmin) return;

    fetchPlayGreetUnreadCount();

    const channel = supabase
      .channel(`play-greet-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "playAndGreet",
          filter: `parent_id=eq.${userId}`,
        },
        () => fetchPlayGreetUnreadCount()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "playAndGreet",
          filter: `sitter_id=eq.${userId}`,
        },
        () => fetchPlayGreetUnreadCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isAdmin, fetchPlayGreetUnreadCount]);

  return null;
}
