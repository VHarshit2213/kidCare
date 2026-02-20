// -------------------------------- old code ---------------------------------------

// import { useQuery } from "@tanstack/react-query";
// import Layout from "@/components/Layout";
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// import { Message, User } from "@/lib/types";
// import { useAuth } from "@/hooks/use-auth";

// export default function Messages() {
//   const { user } = useAuth();
//   const isAuthenticated = !!user;

//   const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
//     queryKey: ["/api/messages", user?.id],
//     enabled: isAuthenticated,
//   });

//   // Extract unique conversation partners
//   const conversationPartners = messages
//     ? Array.from(new Set(messages.map(message =>
//         message.senderId === user?.id ? message.receiverId : message.senderId
//       )))
//     : [];

//   // Fetch user data for conversation partners
//   const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
//     queryKey: ["/api/users/batch", ...conversationPartners],
//     enabled: isAuthenticated && conversationPartners.length > 0,
//   });

//   const getLatestMessage = (partnerId: number) => {
//     if (!messages) return null;

//     return messages
//       .filter(message =>
//         message.senderId === partnerId || message.receiverId === partnerId
//       )
//       .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
//   };

//   const getPartnerName = (partnerId: number) => {
//     if (!users) return "User";
//     const partner = users.find(user => user.id === partnerId);
//     return partner?.fullName || "User";
//   };

//   const getInitials = (name: string) => {
//     return name
//       .split(" ")
//       .map((part) => part[0])
//       .join("")
//       .toUpperCase();
//   };

//   return (
//     <Layout>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <h1 className="text-2xl font-bold text-neutral-800 mb-6">Messages</h1>

//         {!isAuthenticated ? (
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
//             <p className="text-neutral-600">Messages will appear here after booking a sitter.</p>
//           </div>
//         ) : isLoadingMessages || isLoadingUsers ? (
//           <div className="space-y-4">
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4 animate-pulse">
//                 <div className="flex items-center">
//                   <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
//                   <div className="flex-1">
//                     <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
//                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : conversationPartners.length > 0 ? (
//           <div className="space-y-2">
//             {conversationPartners.map((partnerId) => {
//               const latestMessage = getLatestMessage(partnerId);
//               const partnerName = getPartnerName(partnerId);
//               const partner = users?.find(user => user.id === partnerId);

//               return (
//                 <div key={partnerId} className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4 hover:bg-gray-50 cursor-pointer">
//                   <div className="flex items-center">
//                     <Avatar className="h-10 w-10 mr-3">
//                       {partner?.profileImageUrl ? (
//                         <AvatarImage src={partner.profileImageUrl} alt={partnerName} />
//                       ) : (
//                         <AvatarFallback>{getInitials(partnerName)}</AvatarFallback>
//                       )}
//                     </Avatar>
//                     <div className="flex-1">
//                       <div className="flex justify-between">
//                         <h3 className="text-sm font-medium text-neutral-800">{partnerName}</h3>
//                         {latestMessage && (
//                           <span className="text-xs text-neutral-500">
//                             {new Date(latestMessage.timestamp).toLocaleDateString()}
//                           </span>
//                         )}
//                       </div>
//                       {latestMessage && (
//                         <p className="text-sm text-neutral-600 truncate">
//                           {latestMessage.senderId === user?.id ? "You: " : ""}
//                           {latestMessage.content}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
//             <p className="text-neutral-600">You don't have any messages yet.</p>
//             <p className="text-neutral-500 mt-2">Messages from babysitters and parents will appear here.</p>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }

// -------------------------------- old code ---------------------------------------

// -------------------------------- new code ---------------------------------------

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Message, User } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import supabase from "@/config/supabaseClient";
import { useSignedUrl } from "@/hooks/use-signedUrl";
import ChatDialog from "@/components/ChatDialog";
import { format } from "date-fns";
import { FaImages } from "react-icons/fa";

export default function Messages() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const [messages, setMessages] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState({ messages: false, partners: false });
  const [userRole, setUserRole] = useState<"parent" | "babysitter" | null>(
    null
  );
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { getSignedUrl } = useSignedUrl();

  // Get current user role (parent / babysitter)
  const fetchUserRole = useCallback(async () => {
    if (!isAuthenticated) return;

    const roleCheck = async (table: string) =>
      (
        await supabase
          .from(table)
          .select("user_id, fullName, profile_image, phoneNumber")
          .eq("user_id", user.id)
          .maybeSingle()
      ).data;

    const parentResult = await roleCheck("parentprofile");
    if (parentResult) {
      setUserRole("parent");
      setCurrentUserProfile(parentResult);
      return;
    }

    const babysitterResult = await roleCheck("babySitterProfile");
    if (babysitterResult) {
      setUserRole("babysitter");
      setCurrentUserProfile(babysitterResult);
      return;
    }
  }, [isAuthenticated, user?.id]);

  // Fetch all messages for logged-in user
  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading((prev) => ({ ...prev, messages: true }));

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMessages(data);

      // calculate unread counts
      const counts: Record<string, number> = {};
      data.forEach((msg) => {
        if (msg.receiver_id === user.id && !msg.is_read) {
          counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    }

    setLoading((prev) => ({ ...prev, messages: false }));
  }, [isAuthenticated, user?.id]);

  // Extract unique conversation partners
  const conversationPartners = useMemo(() => {
    return messages.length
      ? [
        ...new Set(
          messages.map((msg) =>
            msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
          )
        ),
      ]
      : [];
  }, [messages, user?.id]);

  // Fetch profiles for the opposite role
  const fetchPartners = useCallback(async () => {
    if (!isAuthenticated || !userRole || conversationPartners.length === 0)
      return;
    setLoading((prev) => ({ ...prev, partners: true }));

    const tableName =
      userRole === "parent" ? "babySitterProfile" : "parentprofile";
    const { data, error } = await supabase
      .from(tableName)
      .select("user_id, fullName, profile_image, phoneNumber")
      .in("user_id", conversationPartners);

    if (error) {
      setLoading((prev) => ({ ...prev, partners: false }));
      return;
    }

    // fetch all signed URLs
    const partnersWithUrls = await Promise.all(
      (data || []).map(async (partner) => {
        if (partner.profile_image) {
          const profileImageUrl = await getSignedUrl(partner.profile_image);
          return { ...partner, profileImageUrl };
        }
        return { ...partner, profileImageUrl: null };
      })
    );

    setPartners(partnersWithUrls);
    setLoading((prev) => ({ ...prev, partners: false }));
  }, [isAuthenticated, userRole, conversationPartners]);

  const getLatestMessage = (partnerId: number) => {
    if (!messages) return null;

    return messages
      .filter(
        (message) =>
          message.sender_id === partnerId || message.receiver_id === partnerId
      )
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
  };

  // const getPartnerName = (partnerId: number) => {
  //   if (!partners) return "User";
  //   const partner = partners.find(partner => partner.user_id === partnerId);
  //   return partner?.fullName || "User";
  // };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    fetchUserRole();
  }, [fetchUserRole]);

 useEffect(() => {
  if (!isAuthenticated || !user?.id) return;

  // Initial fetch
  fetchMessages();

  // Subscribe to realtime updates for messages
  const channel = supabase.channel(`realtime_messages_${user.id}`);

  // Listen for new messages where user is the RECEIVER
  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `receiver_id=eq.${user.id}`,
    },
    (payload) => {
      const newMsg = payload.new;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMsg.id);
        if (exists) return prev;
        return [newMsg, ...prev];
      });

      // Increase unread count
      setUnreadCounts((prev) => ({
        ...prev,
        [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1,
      }));

      // Update partner’s latest message
      const partnerId = newMsg.sender_id;
      setPartners((prev) =>
        prev.map((p) =>
          p.user_id === partnerId
            ? {
                ...p,
                last_message: newMsg.message,
                last_message_at: newMsg.created_at,
              }
            : p
        )
      );
    }
  );

  // 📨 Listen for new messages where user is the SENDER
  channel.on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `sender_id=eq.${user.id}`,
    },
    (payload) => {
      const newMsg = payload.new;

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMsg.id);
        if (exists) return prev;
        return [newMsg, ...prev];
      });

      // Update partner’s latest message
      const partnerId = newMsg.receiver_id;
      setPartners((prev) =>
        prev.map((p) =>
          p.user_id === partnerId
            ? {
                ...p,
                last_message: newMsg.message,
                last_message_at: newMsg.created_at,
              }
            : p
        )
      );
    }
  );

  // 👁️ Listen for read-status updates
  channel.on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "messages",
      filter: `receiver_id=eq.${user.id}`,
    },
    (payload) => {
      const updatedMsg = payload.new;
      const oldMsg = payload.old;

      if (!oldMsg.is_read && updatedMsg.is_read) {
        setUnreadCounts((prev) => {
          const senderId = updatedMsg.sender_id;
          const currentCount = prev[senderId] || 0;
          return {
            ...prev,
            [senderId]: Math.max(currentCount - 1, 0),
          };
        });
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
      );
    }
  );

  // Subscribe all
  channel.subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [isAuthenticated, user?.id, fetchMessages]);

useEffect(() => {
  if (
    !isAuthenticated ||
    !userRole ||
    conversationPartners.length === 0 ||
    partners.length === conversationPartners.length // ✅ prevents re-fetching
  )
    return;

  fetchPartners();
}, [isAuthenticated, userRole, conversationPartners]);


  return (
    <>
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 xxl:py-8">
        <h1 className="text-lg xs:text-xl lg:text-2xl font-bold text-brand-blue mb-6">Messages</h1>

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">
              Messages will appear here after booking a sitter.
            </p>
          </div>
        ) : loading.messages || loading.partners ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 p-4 animate-pulse"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : conversationPartners.length > 0 ? (
          <div className="space-y-3">
            {conversationPartners.map((partnerId) => {
              const latestMessage:any = getLatestMessage(partnerId);
              const previewText = latestMessage
                ? latestMessage.image_path
                  ? (
                      <span className="inline-flex items-center gap-1">
                        <FaImages className="text-sm" />
                        <span>image</span>
                      </span>
                    )
                  : latestMessage.map_url
                    ? "📍 location"
                    : latestMessage.message || ""
                : "";
              
              // const partnerName = getPartnerName(partnerId);
              const partner = partners?.find(
                (partner) => partner.user_id === partnerId
              );

              return (
                <ChatDialog
                  key={partnerId}
                  currentUserId={currentUserProfile?.user_id}
                  currentUserName={currentUserProfile?.fullName}
                  otherUserId={partner?.user_id}
                  currentUserPhone={currentUserProfile?.phoneNumber}
                  otherUserPhone={partner?.phoneNumber}
                  otherUserName={partner?.fullName}
                  trigger={
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex flex-col xs:flex-row justify-between gap-2 xs:gap-4">
                        <div className="flex items-center order-2 xs:order-1">
                          <Avatar className="h-10 w-10 mr-3">
                            {partner?.profileImageUrl ? (
                              <AvatarImage
                                src={partner.profileImageUrl}
                                alt={partner?.fullName || "User"}
                              />
                            ) : (
                              <AvatarFallback>
                                {" "}
                                {getInitials(partner?.fullName || "User")}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h3 className="text-sm font-medium text-neutral-800 capitalize">
                              {partner?.fullName || "User"}
                            </h3>
                            {latestMessage && (
                              <p className="text-sm text-neutral-600 line-clamp-1">
                                {latestMessage.sender_id === user?.id
                                  ? "You: "
                                  : ""}
                                {previewText || "Message"}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 order-1 xs:order-2 self-end xs:self-auto">
                          {unreadCounts[partnerId] > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {unreadCounts[partnerId]}
                            </span>
                          )}
                          {latestMessage && (
                            <span className="text-xs text-neutral-500">
                              {format(new Date(latestMessage.created_at), "dd-MM-yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  }
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">You don't have any messages yet.</p>
            <p className="text-neutral-500 mt-2">
              Messages from babysitters and parents will appear here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// -------------------------------- new code ---------------------------------------
