import React from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
    inputText: string;
    setInputText: (text: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    inputText,
    setInputText,
    onSendMessage
}) => {
    return (
        <div className="p-4 border-t border-white/5 bg-[#050505]">
            <form
                onSubmit={onSendMessage}
                className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-2 px-4"
            >
                <input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-hidden text-zinc-200 h-8"
                    placeholder="Write a message..."
                />
                <button
                    type="submit"
                    className="p-2 bg-indigo-600 text-white rounded-xl"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};
