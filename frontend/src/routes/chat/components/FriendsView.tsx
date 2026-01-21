import React from "react";
import { UserPlus, Loader2, Check, X } from "lucide-react";
import { Friend, FriendRequest } from "../../../services/Friends";

interface FriendsViewProps {
    friendSearchQuery: string;
    setFriendSearchQuery: (query: string) => void;
    isAddingFriend: boolean;
    friendError: string;
    friendSuccess: string;
    pendingRequests: FriendRequest[];
    friends: Friend[];
    onAddFriendSubmit: (e: React.FormEvent) => void;
    onAcceptRequest: (requestId: string) => void;
    onRejectRequest: (requestId: string) => void;
    onStartChat: (friend: Friend) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
    friendSearchQuery,
    setFriendSearchQuery,
    isAddingFriend,
    friendError,
    friendSuccess,
    pendingRequests,
    friends,
    onAddFriendSubmit,
    onAcceptRequest,
    onRejectRequest,
    onStartChat
}) => {
    return (
        <main className="flex-1 flex flex-col bg-[#050505] relative animate-in fade-in duration-300 overflow-y-auto">
            <div className="flex flex-col items-center text-zinc-500 p-8 max-w-2xl mx-auto w-full">
                <h2 className="text-2xl font-medium text-white mb-2">Friends List</h2>
                <form onSubmit={onAddFriendSubmit} className="w-full max-w-md mb-8 mt-6">
                    <div className="relative group">
                        <UserPlus className="absolute left-3 top-3 text-zinc-600 w-5 h-5" />
                        <input
                            value={friendSearchQuery}
                            onChange={(e) => setFriendSearchQuery(e.target.value)}
                            placeholder="Enter username to add..."
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 pl-11 pr-24 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                        />
                        <button type="submit" className="absolute right-2 top-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg">
                            {isAddingFriend ? <Loader2 size={16} className="animate-spin" /> : "Add"}
                        </button>
                    </div>
                    {friendSuccess && <div className="text-emerald-400 text-sm mt-2">{friendSuccess}</div>}
                    {friendError && <div className="text-red-400 text-sm mt-2">{friendError}</div>}
                </form>

                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                    <div className="w-full max-w-md mb-8">
                        <h3 className="text-xs font-mono text-zinc-600 mb-2 uppercase">Requests</h3>
                        {pendingRequests.map(r => (
                            <div key={r.id} className="flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-2">
                                <span className="text-white text-sm">{r.sender_name}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => onAcceptRequest(r.id)}><Check size={18} className="text-emerald-500" /></button>
                                    <button onClick={() => onRejectRequest(r.id)}><X size={18} className="text-red-500" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Friends List */}
                <div className="w-full max-w-md">
                    <h3 className="text-xs font-mono text-zinc-600 mb-2 uppercase">Friends ({friends.length})</h3>
                    {friends.map(f => (
                        <div key={f.id} className="flex items-center gap-4 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-2 hover:border-zinc-700 group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                                {f.name[0].toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="text-white text-sm font-medium">{f.name}</div>
                            </div>
                            <button
                                onClick={() => onStartChat(f)}
                                className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                Chat →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};
