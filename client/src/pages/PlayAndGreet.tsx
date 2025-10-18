import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import supabase from "@/config/supabaseClient";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "completed";

type PlayAndGreetType = {
  id: string;
  parent_id: string;
  sitter_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  address_details: string;
  children: any[];
  price: number;
  request_status: RequestStatus;
  sitter_name?: string;
  parent_name?: string;
  created_at?: string;
};

const getStatusMessage = (status: RequestStatus, role: "parent" | "sitter") => {
  const messages: Record<RequestStatus, { parent: string; sitter: string }> = {
    pending: {
      parent: "Waiting for sitter to respond to your request.",
      sitter: "You have a new Play & Greet request.",
    },
    accepted: {
      parent: "Sitter accepted. You can now proceed to payment.",
      sitter: "You accepted this Play & Greet request.",
    },
    rejected: {
      parent: "Sitter declined your request.",
      sitter: "You declined the Play & Greet request.",
    },
    cancelled: {
      parent: "You cancelled the request.",
      sitter: "The parent cancelled the request.",
    },
    completed: {
      parent: "This session has been completed.",
      sitter: "This session has been completed.",
    },
  };

  return messages[status]?.[role] || "Unknown status";
};

const PlayAndGreet = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [requests, setRequests] = useState<PlayAndGreetType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(
    async (showLoader = false) => {
      if (!user?.id) return;
      if (showLoader) setLoading(true);

      const { data, error } = await supabase
        .from("playAndGreet")
        .select("*")
        .or(`parent_id.eq.${user.id},sitter_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching Play & Greet requests:", error.message);
        setRequests([]);
        if (showLoader) setLoading(false);
        return;
      }

      const requestsData = data ?? [];

      const parentIds = Array.from(
        new Set(requestsData.map((item) => item.parent_id).filter(Boolean))
      );
      const sitterIds = Array.from(
        new Set(requestsData.map((item) => item.sitter_id).filter(Boolean))
      );

      let parentMap: Record<string, string> = {};
      let sitterMap: Record<string, string> = {};

      if (parentIds.length > 0) {
        const { data: parentProfiles, error: parentError } = await supabase
          .from("parentprofile")
          .select("user_id, fullName")
          .in("user_id", parentIds);

        if (parentError) {
          console.error("Error fetching parent profiles:", parentError.message);
        } else {
          parentMap =
            parentProfiles?.reduce<Record<string, string>>((acc, profile) => {
              if (profile.user_id) {
                acc[profile.user_id] = profile.fullName ?? "";
              }
              return acc;
            }, {}) ?? {};
        }
      }

      if (sitterIds.length > 0) {
        const { data: sitterProfiles, error: sitterError } = await supabase
          .from("babySitterProfile")
          .select("user_id, fullName")
          .in("user_id", sitterIds);

        if (sitterError) {
          console.error("Error fetching sitter profiles:", sitterError.message);
        } else {
          sitterMap =
            sitterProfiles?.reduce<Record<string, string>>((acc, profile) => {
              if (profile.user_id) {
                acc[profile.user_id] = profile.fullName ?? "";
              }
              return acc;
            }, {}) ?? {};
        }
      }

      const enrichedRequests = requestsData.map((request) => ({
        ...request,
        parent_name: parentMap[request.parent_id] || request.parent_name || "",
        sitter_name: sitterMap[request.sitter_id] || request.sitter_name || "",
      }));

      setRequests(enrichedRequests);

      if (showLoader) setLoading(false);
    },
    [user?.id]
  );

  useEffect(() => {
    if (!user?.id) return;
    fetchRequests(true);
  }, [user?.id, fetchRequests]);

  // useEffect(() => {
  //   if (!user?.id) return;

  //   const channel = supabase
  //     .channel(`play_and_greet_${user.id}`)
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "playAndGreet",
  //         filter: `or(parent_id.eq.${user.id},sitter_id.eq.${user.id})`,
  //       },
  //       () => fetchRequests()
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [user?.id, fetchRequests]);

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    const { error } = await supabase
      .from("playAndGreet")
      .update({ request_status: status })
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error.message);
    } else {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, request_status: status } : req
        )
      );
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">
          Your Play & Greet Sessions
        </h1>

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">
              Please log in to see your Play & Greet sessions.
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
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">No Play & Greet sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((item) => {
              const role: "parent" | "sitter" =
                user?.id === item.parent_id ? "parent" : "sitter";

              const otherPersonName =
                role === "parent" ? item.sitter_name : item.parent_name;

              const statusMessage = getStatusMessage(item.request_status, role);

              return (
                <Card key={item.id} className="bg-white shadow-md border-neutral-200">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-lg font-semibold text-neutral-800">
                          Play & Greet with {otherPersonName || "User"}
                        </div>
                        <div className="text-sm text-gray-600">
                          Date: {item.date} | Time: {item.start_time} - {item.end_time}
                        </div>
                        <div className="text-sm text-gray-600">
                          Location: {item.location}
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                          Status: <span className="capitalize">{item.request_status}</span>
                        </div>
                        <div className="text-sm text-blue-700 italic">
                          {statusMessage}
                        </div>
                      </div>
                      {item.created_at && (
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(item.created_at), "dd-MM-yyyy")}
                        </span>
                      )}
                    </div>

                    {/* ✅ Action Buttons */}
                    {role === "sitter" && item.request_status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleStatusChange(item.id, "accepted")}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, "rejected")}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {role === "parent" && item.request_status === "accepted" && (
                      <button className="bg-indigo-600 text-white px-4 py-1 rounded">
                        Pay Now
                      </button>
                    )}
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

export default PlayAndGreet;
