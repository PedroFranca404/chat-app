import React from "react";
import { MoreVertical } from "lucide-react";
import { Conversation } from "../../../services/Conversations";
import { getDisplayInfo } from "../utils/conversationUtils";
import { Friend } from "../../../services/Friends";

interface ChatHeaderProps {
    activeConversation: Conversation;
    currentUser: any;
    friends: Friend[];
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
    activeConversation,
    currentUser,
    friends
}) => {
    return (
        <div className="sticky top-0 z-20 px-4 pt-4 bg-[#050505]">
            <div className="h-16 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl flex items-center justify-between px-6 shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="text-lg font-medium text-white">
                        {getDisplayInfo(activeConversation, currentUser, friends).name}
                    </div>
                </div>
                <div className="flex items-center gap-4 text-zinc-400">
                    {/* Icons */}
                    <MoreVertical size={20} />
                </div>
            </div>
        </div>
    );
};
