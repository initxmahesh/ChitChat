import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import TypingIndicator from "./TypingIndicator";

const TYPING_STOP_DELAY = 2000;

export default function ChatInput({
  onSend,
  roomName,
  onTypingStart,
  onTypingStop,
  typingUsers = [],
}) {
  const [text, setText] = useState("");
  const isTypingRef = useRef(false);
  const stopTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(stopTimeoutRef.current);
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingStop?.();
      }
    };
  }, [onTypingStop]);

  const handleChange = (e) => {
    setText(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart?.();
    }

    clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop?.();
    }, TYPING_STOP_DELAY);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    clearTimeout(stopTimeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop?.();
    }

    onSend(text.trim());
    setText("");
  };

  return (
    <>
      {/* Typing indicator — outside and above the input border */}
      <TypingIndicator users={typingUsers} />

      <div className="border-t border-gray-100 bg-white">
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 relative">
            {/* Paperclip inside input — left side */}
            <button
              type="button"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md"
            >
              <Paperclip className="w-[17px] h-[17px]" />
            </button>

            <input
              type="text"
              value={text}
              onChange={handleChange}
              placeholder={`Message${roomName ? ` #${roomName}` : ""}…`}
              className="w-full pl-10 pr-10 py-3 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 focus:bg-white transition-all"
            />

            {/* Emoji — right side */}
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-md"
            >
              <Smile className="w-[17px] h-[17px]" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="flex-shrink-0 p-3 sm:p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Send className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>
      </div>
    </>
  );
}
