import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import supabase from "@/config/supabaseClient";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import StatusBadge from "@/components/common/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { Elements } from "@stripe/react-stripe-js";
import { BabysitterStripeCheckout } from "@/components/BabysitterStripeCheckout";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

type RequestStatus = "pending" | "accepted" | "rejected" | "paid";

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
  price: string;
  request_status: RequestStatus;
  sitter_name?: string;
  parent_name?: string;
  sitter_stripeID?: string;
  created_at?: string;
  parent_is_read?: boolean;
  sitter_is_read?: boolean;
};

const getStatusMessage = (status: RequestStatus, role: "parent" | "sitter") => {
  const messages: Record<RequestStatus, { parent: string; sitter: string }> = {
    pending: {
      parent: "Your request has been sent. Waiting for the sitter to respond.",
      sitter: "You have a new Play & Greet request awaiting your response.",
    },
    accepted: {
      parent: "The sitter has accepted your request. You can now proceed with payment.",
      sitter: "You’ve accepted this Play & Greet request. Awaiting parent’s payment.",
    },
    rejected: {
      parent: "The sitter has declined your request.",
      sitter: "You’ve declined this Play & Greet request.",
    },
    paid: {
      parent: "Your payment was successful! The Play & Greet session is confirmed.",
      sitter: "Payment has been received from the parent. Get ready for the Play & Greet!",
    },
    // completed: {
    //   parent: "This Play & Greet session has been successfully completed.",
    //   sitter: "This Play & Greet session has been successfully completed.",
    // },
  };

  return messages[status]?.[role] || "Unknown status";
};

const PlayAndGreet = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAuthenticated = !!user;
  const [requests, setRequests] = useState<PlayAndGreetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const options = {
    clientSecret: stripeClientSecret,
    appearance: {
      theme: "stripe" as const,
    },
  };

  const markRequestsAsRead = useCallback(
    async (records: PlayAndGreetType[]) => {
      if (!user?.id || !records.length) return;

      const parentUnreadIds = records
        .filter(
          (r) =>
            r.parent_id === user.id &&
            (r.parent_is_read === false || r.parent_is_read === undefined)
        )
        .map((r) => r.id);

      const sitterUnreadIds = records
        .filter(
          (r) =>
            r.sitter_id === user.id &&
            (r.sitter_is_read === false || r.sitter_is_read === undefined)
        )
        .map((r) => r.id);

      const updates: Promise<any>[] = [];

      if (parentUnreadIds.length) {
        updates.push(
          supabase
            .from("playAndGreet")
            .update({ parent_is_read: true })
            .in("id", parentUnreadIds)
        );
      }

      if (sitterUnreadIds.length) {
        updates.push(
          supabase
            .from("playAndGreet")
            .update({ sitter_is_read: true })
            .in("id", sitterUnreadIds)
        );
      }

      if (updates.length) {
        try {
          await Promise.all(updates);
        } catch (error) {
          console.error("Failed to mark Play & Greet requests as read:", error);
        }
      }
    },
    [user?.id]
  );

  const fetchRequests = useCallback(async () => {
    if (!user?.id) return setLoading(false);

    setLoading(true);
    try {
      const { data: rawRequests = [], error } = await supabase
        .from("playAndGreet")
        .select("*")
        .or(`parent_id.eq.${user.id},sitter_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Mark unread requests as read
      // const unreadIds = rawRequests
      //   .filter(r => !r.is_read && (r.parent_id === user.id || r.sitter_id === user.id))
      //   .map(r => r.id);

      // if (unreadIds.length > 0) {
      //   await supabase
      //     .from("playAndGreet")
      //     .update({ is_read: true })
      //     .in("id", unreadIds);
      // }

      // Map parent/sitter IDs to names
      const parentIds = Array.from(new Set(rawRequests?.map(r => r.parent_id).filter(Boolean)));
      const sitterIds = Array.from(new Set(rawRequests?.map(r => r.sitter_id).filter(Boolean)));

      const parentMap: Record<string, string> = {};
      const sitterMap: Record<string, any> = {};

      if (parentIds.length) {
        const { data: parents } = await supabase
          .from("parentprofile")
          .select("user_id, fullName")
          .in("user_id", parentIds);
        parents?.forEach(p => { if (p.user_id) parentMap[p.user_id] = p.fullName ?? ""; });
      }

      if (sitterIds.length) {
        const { data: sitters } = await supabase
          .from("babySitterProfile")
          .select("user_id, fullName, stripeAccountID")
          .in("user_id", sitterIds);
        sitters?.forEach(s => {
          if (s.user_id) sitterMap[s.user_id] = { name: s.fullName ?? "", stripeAccountID: s.stripeAccountID ?? "" };
        });
      }

      const enriched = rawRequests?.map(r => ({
        ...r,
        parent_name: parentMap[r.parent_id] ?? r.parent_name ?? "",
        sitter_name: sitterMap[r.sitter_id]?.name ?? r.sitter_name ?? "",
        sitter_stripeID: sitterMap[r.sitter_id]?.stripeAccountID ?? "",
      }));

      const adjustedForViewer =
        enriched?.map((r) => {
          if (user?.id === r.parent_id && !r.parent_is_read) {
            return { ...r, parent_is_read: true };
          }
          if (user?.id === r.sitter_id && !r.sitter_is_read) {
            return { ...r, sitter_is_read: true };
          }
          return r;
        }) ?? [];
        
      setRequests(adjustedForViewer);
      await markRequestsAsRead(enriched ?? []);
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      toast({ title: "Error", description: err.message || "Failed to fetch requests", variant: "destructive" });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast, markRequestsAsRead]);

  const handleStatusChange = async (id: string, status: RequestStatus) => {
    const updates = {
      request_status: status,
      parent_is_read: false,
      sitter_is_read: true,
    };

    const { error } = await supabase
      .from("playAndGreet")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Error updating status:", error.message);
    } else {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, ...updates } : req
        )
      );
    }
  };

  const handlePayment = async (
    price: string,
    sitterStripeID?: string,
    requestId?: string
  ) => {
    if (!sitterStripeID || !requestId) {
      toast({
        title: "Payment Error",
        description: "Sitter does not have a Stripe account connected.",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(price);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Payment Error",
        description: "Invalid payment amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await apiRequest("POST", "/api/payments/create-payment-intent", {
        totalAmount: amount,
        stripeAccountID: sitterStripeID,
        paymentType: "playAndGreet",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to create payment intent");

      // Pass this clientSecret to your Stripe checkout/modal component
      setStripeClientSecret(data.clientSecret);
      setTotalAmount(amount);
      setCurrentRequestId(requestId);
      setShowStripeModal(true);

    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchRequests();
  }, [user?.id, fetchRequests]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`play_and_greet_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "playAndGreet",
        },
        (payload) => {
          const record = payload.new || payload.old;
          if (record?.parent_id === user.id || record?.sitter_id === user.id) {
            fetchRequests();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchRequests]);

  return (
    <>
      <Layout>
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 xxl:py-8">
          <h1 className="text-lg xs:text-xl lg:text-2xl font-bold text-brand-blue mb-6">
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
                    <CardContent className="!p-4 space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-1 order-2 sm:order-none">
                          <div className="text-lg font-semibold text-neutral-800">
                            Play & Greet with {otherPersonName || "User"}
                          </div>
                          {item.children && item.children.length > 0 && (
                            <div className="text-sm text-gray-600">
                              Children:{" "}
                              {item.children.map((child, index) => (
                                <span key={child.id}>
                                  {child.firstName} {child.lastName}
                                  {index < item.children.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-sm text-gray-600">
                            Date: {item.date} | Time: {item.start_time} - {item.end_time}
                          </div>
                          <div className="text-sm text-gray-600 flex gap-1">
                            Location:
                            <div className="flex flex-col">
                              <span> {item.location}</span>
                              {item.address_details && (
                                <span>
                                  {item.address_details}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-800 flex items-center gap-1">
                            Status: <StatusBadge status={item.request_status} />
                          </div>
                          <div className="text-sm text-blue-700 italic">
                            {statusMessage}
                          </div>
                        </div>
                        {item.created_at && (
                          <span className="text-sm text-muted-foreground whitespace-nowrap order-1 sm:order-none self-end sm:self-auto">
                            {format(new Date(item.created_at), "dd-MM-yyyy")}
                          </span>
                        )}
                      </div>

                      {role === "sitter" && item.request_status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleStatusChange(item.id, "accepted")}
                            className="bg-green-700 text-white px-4 py-2 rounded cursor-pointer text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, "rejected")}
                            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {role === "parent" && item.request_status === "accepted" && (
                        <button onClick={() => handlePayment(item.price, item.sitter_stripeID, item.id)} className="bg-[#3c5679] hover:bg-[#2c4059] text-white px-4 py-2 rounded cursor-pointer text-sm">
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

      {showStripeModal && stripeClientSecret && totalAmount !== null && (
        <Elements stripe={stripePromise} options={options}>
          <BabysitterStripeCheckout
            clientSecret={stripeClientSecret}
            amount={totalAmount}
            paymentType="playAndGreet"
            requestId={currentRequestId}
            onSuccess={() => {
              setShowStripeModal(false);
            }}
            onClose={() => {
              setShowStripeModal(false);
            }}
          />
        </Elements>
      )}

    </>
  );
};

export default PlayAndGreet;
