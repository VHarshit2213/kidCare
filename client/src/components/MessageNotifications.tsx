import { useEffect } from "react";
import supabase from "@/config/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import logo from "../assets/enchanted-logo.png";

interface MessageNotificationsProps {
  currentUserId: string; 
}

export default function MessageNotifications({ currentUserId }: MessageNotificationsProps) {
  const { toast } = useToast();
  
  useEffect(() => {
    // Ask for browser notification permission once
    Notification.requestPermission();

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

          // Browser notification
          if (Notification.permission === "granted") {
            new Notification(title, {
              body: message.message,
              icon: logo,
            });
          } else {
            toast({
              title: title,
              description: message.message,
            });
          }
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

          // Browser notification
          if (Notification.permission === "granted") {
            new Notification(title, {
              body: body,
              icon: logo,
            });
          } else {
            toast({
              title: title,
              description: body,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, [currentUserId]);

  return null;
}
