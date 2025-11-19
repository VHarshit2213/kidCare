import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import supabase from "@/config/supabaseClient";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const BookingNotification = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAndMarkNotifications = useCallback(
    async (showLoader = false) => {
      if (!user?.id) return;

      if (showLoader) {
        setLoading(true);
      }

      const { data: notificationsData, error } = await supabase
        .from("bookingNotification")
        .select("*")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Error fetching booking notifications:",
          error.message
        );

        if (showLoader) {
          setLoading(false);
        }
        return;
      }

      const notificationsList = notificationsData ?? [];
      const unreadIds = notificationsList
        .filter((notification) => !notification.is_read)
        .map((notification) => notification.id);

      if (unreadIds.length > 0) {
        setNotifications(
          notificationsList.map((notification) =>
            unreadIds.includes(notification.id)
              ? { ...notification, is_read: true }
              : notification
          )
        );
      } else {
        setNotifications(notificationsList);
      }

      if (showLoader) {
        setLoading(false);
      }

      if (unreadIds.length > 0) {
        const { error: updateError } = await supabase
          .from("bookingNotification")
          .update({ is_read: true })
          .in("id", unreadIds);

        if (updateError) {
          console.error(
            "Error marking notifications as read:",
            updateError.message
          );

          // revert optimistic update to reflect server state
          setNotifications(notificationsList);
        }
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!user?.id) return;
    fetchAndMarkNotifications(true);
  }, [user?.id, fetchAndMarkNotifications]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`booking_notifications_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookingNotification",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => fetchAndMarkNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchAndMarkNotifications]);

  return (
    <Layout>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 xxl:py-8">
        <h1 className="text-lg xs:text-xl lg:text-2xl font-bold text-brand-blue mb-6">
          Your Booking Notification
        </h1>

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">
              Notification will appear here after login.
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 p-4 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">No booking notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const message = notification?.message
                ?.split(/\n/)
                .filter((line: string) => line.trim() !== "")
                .map((line: String, idx: number) => <p key={idx}>{line}</p>);

              return (
                <Card
                  key={notification.id}
                  className="bg-white shadow-md border-neutral-200"
                >
                  <CardContent className="!p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="text-base text-gray-600 order-2 sm:order-none">{message}</div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap order-1 sm:order-none self-end sm:self-auto">
                        {format(
                          new Date(notification.created_at),
                          "dd-MM-yyyy"
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingNotification;
