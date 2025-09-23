import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import supabase from "@/config/supabaseClient";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const BookingNotification = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [notifications, setNotifications] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotification = async () => {
      setLoading(true);

      // Fetch booking notification for logged-in User
      const { data: notification, error: notificationError } = await supabase
        .from("bookingNotification")
        .select(`*`)
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false });

      if (notificationError)
        console.error("Error fetching notification:", notificationError);

      setNotifications(notification);
      setLoading(false);
    };

    fetchNotification();
  }, [user]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">
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
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-base text-gray-600">{message}</div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
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
