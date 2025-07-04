import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Message, User } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

export default function Messages() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", user?.id],
    enabled: isAuthenticated,
  });

  // Extract unique conversation partners
  const conversationPartners = messages
    ? Array.from(new Set(messages.map(message => 
        message.senderId === user?.id ? message.receiverId : message.senderId
      )))
    : [];

  // Fetch user data for conversation partners
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/users/batch", ...conversationPartners],
    enabled: isAuthenticated && conversationPartners.length > 0,
  });

  const getLatestMessage = (partnerId: number) => {
    if (!messages) return null;
    
    return messages
      .filter(message => 
        message.senderId === partnerId || message.receiverId === partnerId
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const getPartnerName = (partnerId: number) => {
    if (!users) return "User";
    const partner = users.find(user => user.id === partnerId);
    return partner?.fullName || "User";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">Messages</h1>

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">Messages will appear here after booking a sitter.</p>
          </div>
        ) : isLoadingMessages || isLoadingUsers ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4 animate-pulse">
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
          <div className="space-y-2">
            {conversationPartners.map((partnerId) => {
              const latestMessage = getLatestMessage(partnerId);
              const partnerName = getPartnerName(partnerId);
              const partner = users?.find(user => user.id === partnerId);
              
              return (
                <div key={partnerId} className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      {partner?.profileImageUrl ? (
                        <AvatarImage src={partner.profileImageUrl} alt={partnerName} />
                      ) : (
                        <AvatarFallback>{getInitials(partnerName)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-sm font-medium text-neutral-800">{partnerName}</h3>
                        {latestMessage && (
                          <span className="text-xs text-neutral-500">
                            {new Date(latestMessage.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {latestMessage && (
                        <p className="text-sm text-neutral-600 truncate">
                          {latestMessage.senderId === user?.id ? "You: " : ""}
                          {latestMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200 p-8 text-center">
            <p className="text-neutral-600">You don't have any messages yet.</p>
            <p className="text-neutral-500 mt-2">Messages from babysitters and parents will appear here.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
