import React from "react";
import {
    Code,
    LogOut,
    Search,
    Users,
    Hash,
    Plus,
    X
} from "lucide-react";
import { Conversation } from "../../../services/Conversations";
import { SettingsComponent } from "../../../components/settings";
import { getDisplayInfo } from "../utils/conversationUtils";
import { Friend } from "../../../services/Friends";
import { ViewType } from "../types";
import { handleHideConversation, handleLeaveConversation } from "../../../services/Conversations";

interface SidebarProps {
    currentUser: any;
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
    conversations: Conversation[];
    activeChat: string | null;
    setActiveChat: (chatId: string | null) => void;
    friends: Friend[];
    onLogout: () => void;
    onCreateGroup: () => void;
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
    currentUser,
    currentView,
    setCurrentView,
    conversations,
    activeChat,
    setActiveChat,
    friends,
    onLogout,
    onCreateGroup,
    setConversations
}) => {
    return (
        <aside className="w-80 flex flex-col border-r border-white/5 bg-zinc-900/20 backdrop-blur-md relative z-50">
            <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                        <Code size={16} />
                    </div>
                    <span className="font-semibold tracking-tight text-white">
                        Chat App
                    </span>
                </div>
                <button
                    onClick={onLogout}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                >
                    <LogOut size={16} />
                </button>
            </div>

            <div className="px-5 mb-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 text-zinc-600 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-hidden focus:border-indigo-500/50 transition-all"
                    />
                </div>
            </div>

            <div className="px-3 mb-2">
                <button
                    onClick={() => setCurrentView("friends")}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${currentView === "friends"
                        ? "bg-white/5 border border-white/5"
                        : "hover:bg-white/5 border border-transparent"
                        }`}
                >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 transition-colors group-hover:border-indigo-500/50">
                        <Users size={18} />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-white">Friends</div>
                    </div>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                <div className="flex items-center justify-between px-3 mb-2">
                    <h3 className="text-[10px] font-mono uppercase text-zinc-600 tracking-widest">
                        Conversations
                    </h3>
                    <button
                        onClick={onCreateGroup}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                {conversations.map((conv) => {
                    const info = getDisplayInfo(conv, currentUser, friends);
                    return (
                        <div key={conv.id} className="relative group/item">
                            <button
                                onClick={() => {
                                    setActiveChat(conv.id);
                                    setCurrentView("chat");
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentView === "chat" && activeChat === conv.id
                                    ? "bg-white/5 border-white/5"
                                    : "hover:bg-white/5"
                                    }`}
                            >
                                <div className="relative">
                                    {info.isGroup ? (
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                                            <Hash size={18} />
                                        </div>
                                    ) : (
                                        <img
                                            src={"https://github.com/shadcn.png"}
                                            alt={info.name}
                                            className="w-10 h-10 rounded-xl grayscale group-hover:grayscale-0 transition-all"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="text-sm font-medium text-white truncate w-32">
                                        {info.name}
                                    </div>
                                    <div className="text-xs font-mono text-zinc-600 truncate">
                                        {info.isGroup ? "Group Chat" : "DM"}
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (conv.is_group) {
                                        if (window.confirm("Are you sure you want to LEAVE this group? This action cannot be undone.")) {
                                            try {
                                                await handleLeaveConversation(conv.id);
                                                setConversations(prev => prev.filter(c => c.id !== conv.id));
                                                if (activeChat === conv.id) setActiveChat(null);
                                            } catch (err) {
                                                console.error("Failed to leave group", err);
                                                alert("Failed to leave group. Please try again.");
                                            }
                                        }
                                    } else {
                                        if (window.confirm("Are you sure you want to hide this conversation?")) {
                                            try {
                                                await handleHideConversation(conv.id);
                                                setConversations(prev => prev.filter(c => c.id !== conv.id));
                                                if (activeChat === conv.id) setActiveChat(null);
                                            } catch (err) {
                                                console.error("Failed to hide conversation", err);
                                            }
                                        }
                                    }
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all z-10"
                                title={conv.is_group ? "Leave Group" : "Hide Conversation"}
                            >
                                {conv.is_group ? <LogOut size={14} /> : <X size={14} />}
                            </button>
                        </div>
                    )
                })}
            </div>

            <div className="p-4 border-t border-white/5 bg-zinc-900/30">
                <div className="flex items-center gap-3">
                    {/* Current User Profile Footer */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10" />
                    <div className="flex-1">
                        <div className="text-sm text-white font-medium">{currentUser.name || "Me"}</div>
                        <div className="text-[10px] text-emerald-500 font-mono">
                            Online
                        </div>
                    </div>
                    <SettingsComponent />
                </div>
            </div>
        </aside>
    );
};
