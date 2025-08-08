import { useEffect, useState } from "react";
import { IoMdClose, IoIosSend } from "react-icons/io";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface ChatDialogProps {
  currentUserId: string;
  otherUserId: string;
  currentUserPhone: string;
  otherUserPhone: string;
  otherUserName: string;
  onClose: () => void;
}

const ChatDialog = ({
  currentUserId,
  otherUserId,
  currentUserPhone,
  otherUserPhone,
  otherUserName,
  onClose,
}: ChatDialogProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  //  Fetch chat history
  useEffect(() => {
    let initial = true;

    const fetchMessages = async () => {
      if (initial) setLoading(true);
      try {
        const res = await fetch(
          `/api/conversation?sender_id=${currentUserId}&receiver_id=${otherUserId}`,
        );
        if (!res.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Fetch messages error:", error);
      } finally {
        if (initial) {
          setLoading(false);
          initial = false;
        }
      }
    };

    fetchMessages();

    // Optional: polling every 5s or use Supabase real-time
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [currentUserId, otherUserId]);

  //  Send message
  const handleSend = async () => {
    if (!input.trim()) return;

    await apiRequest("POST", "/api/send-message", {
      sender_phone: currentUserPhone,
      receiver_phone: otherUserPhone,
      message: input,
      sender_id: currentUserId,
      receiver_id: otherUserId,
    });

    setMessages((prev) => [
      ...prev,
      {
        sender_id: currentUserId,
        receiver_id: otherUserId,
        message: input,
        direction: "outbound",
        // created_at: new Date().toISOString(),
      },
    ]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md shadow-lg flex flex-col h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-100 rounded-t-xl">
          <h4 className="text-lg font-semibold text-gray-700">
            Chat with {otherUserName}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 font-bold text-xl"
          >
            <IoMdClose />
          </button>
        </div>

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
                const msgDate = format(new Date(msg.created_at), "yyyy-MM-dd");
                const showDate = msgDate !== lastDate;
                lastDate = msgDate;

                const today = format(new Date(), "yyyy-MM-dd");
                const yesterday = format(
                  new Date(Date.now() - 86400000),
                  "yyyy-MM-dd",
                );
                const label =
                  msgDate === today
                    ? "Today"
                    : msgDate === yesterday
                      ? "Yesterday"
                      : format(new Date(msg.created_at), "dd MMM yyyy");

                return (
                  <div key={i} className="flex flex-col items-center">
                    {showDate && (
                      <div className="my-2 text-xs text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
                        {label}
                      </div>
                    )}
                    <div
                      className={`w-fit max-w-[80%] px-4 py-2 rounded-lg text-sm flex items-end gap-3 ${
                        isMe
                          ? "bg-blue-500 text-white self-end ml-auto"
                          : "bg-gray-200 text-gray-800 self-start mr-auto"
                      }`}
                    >
                      <span>{msg.message}</span>
                      <span
                        className={`text-[10px] mt-1 whitespace-nowrap ${
                          isMe ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {format(new Date(msg.created_at), "h:mm a")}
                      </span>
                    </div>
                  </div>
                );
              });
            })()
          ) : (
            <div className="text-center text-gray-400">No messages yet.</div>
          )}
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
            className="px-4 py-2 bg-[#3c5679] hover:bg-[#2c4059] text-white rounded-md flex items-center gap-1 gap-1"
          >
            <IoIosSend />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDialog;
