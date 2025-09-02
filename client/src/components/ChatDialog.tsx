import { useEffect, useState } from "react";
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

interface ChatDialogProps {
  currentUserId: string;
  otherUserId: string;
  currentUserPhone: string;
  otherUserPhone: string;
  otherUserName: string;
  trigger: React.ReactNode;
}

const ChatDialog = ({
  currentUserId,
  otherUserId,
  currentUserPhone,
  otherUserPhone,
  otherUserName,
  trigger,
}: ChatDialogProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);

  //  Fetch chat history
  useEffect(() => {
    if (!isOpen) return;
    let initial = true;

    const fetchMessages = async () => {
      if (initial) setLoading(true);
      try {
        const res = await fetch(
          `/api/conversation?sender_id=${currentUserId}&receiver_id=${otherUserId}`
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
  }, [currentUserId, otherUserId, isOpen]);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {" "}
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex flex-col h-[80vh] max-w-md w-full bg-white !rounded-xl shadow-lg p-0 gap-0">
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
                const msgDate = format(new Date(msg.created_at), "yyyy-MM-dd");
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
