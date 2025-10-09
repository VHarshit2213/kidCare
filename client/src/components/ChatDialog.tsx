import { useEffect, useRef, useState } from "react";
import { IoMdClose, IoIosSend } from "react-icons/io";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "./ui/dialog";
import supabase from "@/config/supabaseClient";
import { MdOutlineLocationOn } from "react-icons/md";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface ChatDialogProps {
  currentUserId: string;
  currentUserName: string;
  otherUserId: string;
  currentUserPhone: string;
  otherUserPhone: string;
  otherUserName: string;
  trigger: React.ReactNode;
}

const ChatDialog = ({
  currentUserId,
  currentUserName,
  otherUserId,
  currentUserPhone,
  otherUserPhone,
  otherUserName,
  trigger,
}: ChatDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");
  const [sendingLocation, setSendingLocation] = useState(false);

  const isBabySitter = user?.user_metadata?.userType === "babysitter";

  const scrollToBottom = (smooth = true) => {
  messagesEndRef.current?.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
  });
};

  //  Fetch chat history
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/conversation?sender_id=${currentUserId}&receiver_id=${otherUserId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await res.json();
        setMessages(data);
        scrollToBottom(false);
      } catch (error) {
        console.error("Fetch messages error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to real-time messages
    const channel = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.new.sender_id === otherUserId) {
            setMessages((prev) => [...prev, payload.new]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId, isOpen]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  //  Send message
  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);

    try {
      await apiRequest("POST", "/api/send-message", {
        sender_phone: currentUserPhone,
        receiver_phone: otherUserPhone,
        message: input,
        sender_id: currentUserId,
        sender_name: currentUserName,
        receiver_id: otherUserId,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender_id: currentUserId,
          receiver_id: otherUserId,
          message: input,
          direction: "outbound",
          created_at: new Date().toISOString(),
        },
      ]);
      setInput("");
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

  // Handle send location
  const handleSendLocation = async () => {
    setSendingLocation(true);
    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      );

      const { latitude, longitude } = position.coords;

      // Mapbox static map image URL
      const mapImgUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${longitude},${latitude})/${longitude},${latitude},15/300x200?access_token=${mapboxgl.accessToken}`;

      await apiRequest("POST", "/api/send-message", {
        sender_phone: currentUserPhone,
        receiver_phone: otherUserPhone,
        message: locationMsg,
        sender_id: currentUserId,
        sender_name: currentUserName,
        receiver_id: otherUserId,
        location: {
          latitude,
          longitude,
        },
        map_url: mapImgUrl,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender_id: currentUserId,
          receiver_id: otherUserId,
          message: locationMsg,
          location: {
            latitude,
            longitude,
          },
          map_url: mapImgUrl,
          direction: "outbound",
          created_at: new Date().toISOString(),
        },
      ]);

      toast({
        title: "Location sent!",
        description: "Your current location has been shared with the parent.",
      });

      setLocationMsg("");
      setIsLocationDialogOpen(false);
    } catch (error) {
      console.error("Error sending location:", error);
      toast({
        title: "Failed to send location",
        description:
          "Please enable GPS and allow location access to share your location.",
        variant: "destructive",
      });
    } finally {
      setSendingLocation(false);
    }
  };

  return (
    <>
      {/* chat dialog  */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {" "}
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="flex flex-col h-[80vh] max-w-lg w-full bg-white !rounded-xl shadow-lg p-0 gap-0">
          <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-xl">
            <DialogTitle className="text-lg font-semibold text-gray-700 capitalize">
              Chat with {otherUserName}
            </DialogTitle>
          </DialogHeader>
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : messages.length > 0 ? (
              (() => {
                let lastDate: string | null = null;

                return messages.map((msg, i) => {
                  const isMe = msg.sender_id === currentUserId;
                  const msgDate = format(
                    new Date(msg.created_at),
                    "yyyy-MM-dd"
                  );
                  const showDate = msgDate !== lastDate;
                  lastDate = msgDate;

                  const today = format(new Date(), "yyyy-MM-dd");
                  const yesterday = format(
                    new Date(Date.now() - 86400000),
                    "yyyy-MM-dd"
                  );
                  const label =
                    msgDate === today
                      ? "Today"
                      : msgDate === yesterday
                        ? "Yesterday"
                        : format(new Date(msg.created_at), "dd MMM yyyy");

                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      {showDate && (
                        <div className="my-2 text-xs text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                          {label}
                        </div>
                      )}

                      {/* Render map first if exists */}
                      {msg.map_url && (
                        <div
                          className={`w-fit max-w-[80%] rounded-lg text-sm flex overflow-hidden ${isMe
                            ? "self-end ml-auto"
                            : "self-start mr-auto"
                            }`}
                        >
                          <div className="relative w-full overflow-hidden rounded-lg">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${msg.location?.latitude},${msg.location?.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={msg.map_url}
                                alt="Location preview"
                                className="w-full h-52 object-cover"
                              />
                              {/* Overlay with text + time */}
                              <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white text-xs flex justify-between items-center px-3 py-1">
                                <span>📍 {"Location"}</span>
                                <span>{format(new Date(msg.created_at), "h:mm a")}</span>
                              </div>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Render text as separate bubble if present */}
                      {msg.message && (
                        <div
                          className={`w-fit max-w-[80%] rounded-lg text-sm flex gap-3 ${isMe
                            ? "bg-blue-500 text-white self-end ml-auto"
                            : "bg-gray-200 text-gray-800 self-start mr-auto"
                            }`}
                        >
                          <div className="px-3 py-2 break-words">{msg.message}</div>
                          <span
                            className={`text-[10px] mt-1 mb-1 mr-2 self-end whitespace-nowrap ${isMe ? "text-blue-100" : "text-gray-500"
                              }`}
                          >
                            {format(new Date(msg.created_at), "h:mm a")}
                          </span>
                        </div>
                      )}
                    </div>
                  );

                });
              })()
            ) : (
              <div className="text-center text-gray-400">No messages yet.</div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="flex items-center p-4 border-t border-gray-200 bg-white gap-2 rounded-b-xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className={`px-4 py-2 bg-[#3c5679] hover:bg-[#2c4059] text-white rounded-md flex items-center gap-1 disabled:cursor-not-allowed`}
            >
              {sending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  sending...
                </>
              ) : (
                <>
                  <IoIosSend />
                  Send
                </>
              )}
            </button>
            {isBabySitter && (
              <button
                onClick={() => setIsLocationDialogOpen(true)}
                className={`px-4 py-2 bg-white text-red-600 border-2 border-red-600 rounded-md flex items-center gap-1 disabled:cursor-not-allowed`}
                title="Send Location"
              >
                <MdOutlineLocationOn /> Location
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog
        open={isLocationDialogOpen}
        onOpenChange={setIsLocationDialogOpen}
      >
        <DialogContent className="max-w-md bg-white !rounded-xl shadow-lg p-0 gap-0">
          <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-100 rounded-t-xl">
            <DialogTitle>Send Your Current Location</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 p-4 space-y-2 bg-gray-50 rounded-b-xl">
            <p className="text-sm text-gray-500">
              You can add a short message below. When you tap{" "}
              <strong>Send Location</strong>, your current location will be
              shared with the parent automatically.
            </p>
            <textarea
              value={locationMsg}
              onChange={(e) => setLocationMsg(e.target.value)}
              placeholder="Write an optional message..."
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={handleSendLocation}
                disabled={sendingLocation}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-70"
              >
                {sendingLocation ? "Sending..." : "Send Location"}
              </button>
            </div>
            <p className="text-sm text-red-500 text-center">
              Your live location will be sent with this message.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatDialog;
