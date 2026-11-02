import { MessageCircle } from "lucide-react";

type FloatingChatProps = {
  onClick: () => void;
};

export function FloatingChat({ onClick }: FloatingChatProps) {
  return (
    <button type="button" className="floating-chat" onClick={onClick} aria-label="Chat with POIGAI on WhatsApp">
      <MessageCircle size={22} />
      <span>Chat with us</span>
    </button>
  );
}
