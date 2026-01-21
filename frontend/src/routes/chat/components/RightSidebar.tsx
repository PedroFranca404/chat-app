import React from "react";
import { Hash, Edit2 } from "lucide-react";
import { Conversation } from "../../../services/Conversations";
import { getDisplayInfo } from "../utils/conversationUtils";
import { Friend } from "../../../services/Friends";

interface RightSidebarProps {
    activeConversation: Conversation;
    currentUser: any;
    friends: Friend[];
    onEditGroup: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
    activeConversation,
    currentUser,
    friends,
    onEditGroup
}) => {
    return (
        <aside className="w-72 bg-[#050505] border-l border-white/5 hidden xl:flex flex-col">
            <div className="p-6 flex flex-col items-center border-b border-white/5 relative group/sidebar">
                {/* Edit Button for Admins */}
                {activeConversation && activeConversation.is_group &&
                    activeConversation.participants?.find(p => p.user_id === currentUser.id)?.role === 'admin' && (
                        <button
                            onClick={onEditGroup}
                            className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                            title="Edit Group"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}

                <div className="w-24 h-24 rounded-2xl mb-4 flex items-center justify-center overflow-hidden bg-zinc-900 border border-zinc-800">
                    {activeConversation && activeConversation.avatar_url ? (
                        <img src={activeConversation.avatar_url} alt={activeConversation.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800/50">
                            {activeConversation?.name ? (
                                <span className="text-3xl font-bold text-zinc-500">{activeConversation.name[0].toUpperCase()}</span>
                            ) : <Hash className="text-zinc-600" size={32} />}
                        </div>
                    )}
                </div>
                <h2 className="text-lg font-medium text-white text-center">{getDisplayInfo(activeConversation, currentUser, friends).name}</h2>
                {activeConversation?.description && (
                    <p className="text-sm text-zinc-500 text-center mt-2 px-2">{activeConversation.description}</p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-xs font-mono text-zinc-600 uppercase mb-4 px-2">
                    Members ({activeConversation?.participants?.length || 0})
                </h3>
                <div className="space-y-2">
                    {activeConversation?.participants?.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                {p.user?.avatar_url ? (
                                    <img src={p.user.avatar_url} className="w-full h-full rounded-full" />
                                ) : (
                                    <span className="text-xs font-medium text-indigo-400">
                                        {p.user?.name?.[0].toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-white font-medium flex items-center gap-2">
                                    {p.user?.name || "Unknown"}
                                    {p.role === 'admin' && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/20">
                                            ADMIN
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};
