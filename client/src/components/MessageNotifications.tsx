import { useEffect } from "react";
import supabase from "@/config/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import logo from "../assets/enchanted-logo.png";

interface MessageNotificationsProps {
  currentUserId: string; 
}

export default function MessageNotifications({ currentUserId }: MessageNotificationsProps) {
  const { toast } = useToast();
  
  // Safe check for Notification API (prevents Safari crash)
  const isNotificationSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    typeof Notification !== "undefined";

  useEffect(() => {

    // SAFARI-SAFE: Only request permission if supported
    if (isNotificationSupported) {
      try {
        Notification.requestPermission().catch(() => {});
      } catch (err) {
        console.warn("Safari blocked Notification permission:", err);
      }
    }

    // Helper to safely show notifications
    const showNotification = (title: string, body: string) => {
      if (isNotificationSupported && Notification.permission === "granted") {
        try {
          new Notification(title, { body, icon: logo });
        } catch (err) {
          console.warn("Notification error:", err);
          toast({ title, description: body });
        }
      } else {
        toast({ title, description: body });
      }
    };

    // Subscribe to INSERT events in messages table
    const messagesChannel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const message = payload.new;
          const title = message?.sender_name
            ? `${message.sender_name} sent you a message`
            : "You have a new message from The Enchanted Co.";

          showNotification(title, message.message);
        }
      )
      .subscribe();

    // Subscribe to INSERT events in bookingNotification table
    const bookingsChannel = supabase
      .channel("bookingNotification")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookingNotification",
          filter: `receiver_id=eq.${currentUserId}`, // only messages for this user
        },
        (payload) => {
          const notification = payload.new;
          const title = "New Booking Notification";
          const body = notification.message;

          showNotification(title, body);
        }
      )
      .subscribe();

    // Subscribe to Play & Greet events for both parents and sitters
    const channelName = `play-and-greet-${currentUserId}`;
    const playAndGreetChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "playAndGreet",
        },
        (payload) => {
          const next = payload.new;
          const prev = payload.old;

          // Only care about this user
          if (!next || (next.parent_id !== currentUserId && next.sitter_id !== currentUserId)) {
            return;
          }

          const isParent = next.parent_id === currentUserId;
          const isSitter = next.sitter_id === currentUserId;

          let title = "";
          let body = "";

          if (payload.eventType === "INSERT") {
            if (!isSitter) return; // Only notify sitters for new requests
            title = "New Play & Greet Request";
            body = "You have received a new Play & Greet request.";

          // UPDATE — only when request_status changes
          } else if (payload.eventType === "UPDATE") {
            // Ignore updates where status didn't change
            if (!prev || next.request_status === prev.request_status) return;
            
            if (isParent) {
              switch (next.request_status) {
                case "accepted":
                  title = "Play & Greet Accepted";
                  body = "Your Play & Greet request has been accepted.";
                  break;
                case "rejected":
                  title = "Play & Greet Declined";
                  body = "Your Play & Greet request has been declined.";
                  break;
                case "paid":
                  title = "Play & Greet Paid";
                  body = "Payment for your Play & Greet session is confirmed.";
                  break;
                default:
                  return;
              }
            } else if (isSitter) {
              switch (next.request_status) {
                case "paid":
                  title = "Play & Greet Confirmed";
                  body = "Payment received for the Play & Greet session.";
                  break;
                // case "rejected":
                //   title = "Play & Greet Canceled";
                //   body = "The Play & Greet request was canceled.";
                //   break;
                default:
                  return;
              }
            }
          }

          if (title && body) {
            showNotification(title, body);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(playAndGreetChannel);
    };
  }, [currentUserId , isNotificationSupported]);

  return null;
}
