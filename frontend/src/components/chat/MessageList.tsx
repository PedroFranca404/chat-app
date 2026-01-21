import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { MessageUI } from "../../utils/types";
import { Conversation } from "../../services/Conversations";

interface MessageListProps {
    messages: MessageUI[];
    activeConversation: Conversation;
    currentUser: any;
    editingMessageId: string | null;
    editContent: string;
    setEditContent: (content: string) => void;
    onEditClick: (msg: MessageUI) => void;
    onDeleteClick: (messageId: string) => void;
    onUpdateMessage: (e: React.FormEvent) => void;
    onCancelEdit: () => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({
    messages,
    activeConversation,
    editingMessageId,
    editContent,
    setEditContent,
    onEditClick,
    onDeleteClick,
    onUpdateMessage,
    onCancelEdit,
    messagesEndRef
}) => {
    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
            {messages.map((msg, i) => {
                const isMe = msg.sender === "me";
                const prevMsg = i > 0 ? messages[i - 1] : null;
                const nextMsg = i < messages.length - 1 ? messages[i + 1] : null;

                const isFirstInSeq = !prevMsg || prevMsg.sender !== msg.sender;
                const isLastInSeq = !nextMsg || nextMsg.sender !== msg.sender;

                if ((msg as any).type === 'system') {
                    return (
                        <div key={msg.id} className="w-full flex justify-center my-4">
                            <span className="text-xs text-zinc-500 bg-zinc-900/50 px-2 py-1 rounded-full border border-zinc-800">
                                {msg.text}
                            </span>
                        </div>
                    );
                }

                return (
                    <div
                        key={msg.id}
                        className={`flex w-full ${isLastInSeq ? "mb-6" : "mb-1"} ${isMe ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {!isMe && activeConversation?.is_group && isFirstInSeq && (() => {
                                const senderId = msg.sender;
                                const sender = activeConversation.participants?.find(p => p.user_id === senderId)?.user;
                                return (
                                    <div className="flex items-center gap-2 mb-1 ml-1 mt-2">
                                        <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden bg-zinc-800 border border-zinc-700">
                                            {sender?.avatar_url ? (
                                                <img src={sender.avatar_url} alt={sender.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-[9px] font-medium text-indigo-400">
                                                    {sender?.name?.[0]?.toUpperCase() || "?"}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-zinc-500 font-medium">{sender?.name || "Unknown"}</span>
                                    </div>
                                );
                            })()}
                            <div
                                className={`px-6 py-3.5 rounded-2xl text-sm ${isMe
                                    ? "bg-zinc-800/50 border border-indigo-500/20 text-indigo-50 " + (isFirstInSeq ? "rounded-tr-2xl" : "rounded-tr-md") + " " + (isLastInSeq ? "rounded-br-2xl" : "rounded-br-md")
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 " + (isFirstInSeq ? "rounded-tl-2xl" : "rounded-tl-md") + " " + (isLastInSeq ? "rounded-bl-2xl" : "rounded-bl-md")
                                    }`}
                            >
                                {editingMessageId === msg.id ? (
                                    <form onSubmit={onUpdateMessage} className="flex flex-col gap-2 min-w-[200px]">
                                        <input
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="bg-transparent border-b border-white/20 focus:outline-none focus:border-white/50 pb-1 text-zinc-200 w-full"
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={onCancelEdit} className="text-xs text-zinc-400 hover:text-white">Cancel</button>
                                            <button type="submit" className="text-xs text-indigo-400 hover:text-indigo-300">Save</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="relative group/bubble">
                                        {msg.text}
                                        {isMe && msg.text !== "Message Erased" && (
                                            <div className="absolute -right-6 top-0 hidden group-hover/bubble:flex flex-col gap-1 bg-zinc-900 border border-zinc-800 rounded-md p-1 shadow-lg z-10">
                                                <button
                                                    onClick={() => onEditClick(msg)}
                                                    className="text-zinc-500 hover:text-indigo-400 p-1 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteClick(msg.id)}
                                                    className="text-zinc-500 hover:text-red-400 p-1 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {isLastInSeq && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-mono text-zinc-600">
                                        {msg.time}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
};
