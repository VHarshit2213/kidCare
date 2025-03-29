import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@/lib/types";

interface MessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User & { distance?: number };
}

export default function MessageDialog({
  isOpen,
  onClose,
  recipient
}: MessageDialogProps) {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, this would send the message to the backend
      console.log(`Sending message to ${recipient.fullName}: ${message}`);
      window.alert(`Message sent to ${recipient.fullName}!`);
      setMessage("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Message {recipient.fullName}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Type your message to ${recipient.fullName}...`}
            className="min-h-[150px] resize-none focus-visible:ring-brand-blue"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            style={{ backgroundColor: "#3c5679" }}
            className="text-white font-medium"
          >
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}