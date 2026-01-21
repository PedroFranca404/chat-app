import React from "react";
import { X, Search, Check, ChevronRight, ArrowLeft, Loader2, Users } from "lucide-react";
import { Friend } from "../../services/Friends";

interface GroupCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    friends: Friend[];
    groupCreationStep: 'select-friends' | 'group-details';
    setGroupCreationStep: (step: 'select-friends' | 'group-details') => void;
    selectedFriendIds: Set<string>;
    toggleFriendSelection: (friendId: string) => void;
    newGroupName: string;
    setNewGroupName: (name: string) => void;
    isCreatingGroup: boolean;
    onCreateGroup: () => void;
}

export const GroupCreationModal: React.FC<GroupCreationModalProps> = ({
    isOpen,
    onClose,
    friends,
    groupCreationStep,
    setGroupCreationStep,
    selectedFriendIds,
    toggleFriendSelection,
    newGroupName,
    setNewGroupName,
    isCreatingGroup,
    onCreateGroup
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">
                        {groupCreationStep === 'select-friends' ? "New Group Chat" : "Group Details"}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {groupCreationStep === 'select-friends' ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-zinc-500 w-4 h-4" />
                                <input
                                    placeholder="Search friends..."
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-mono text-zinc-500 uppercase px-1 mb-2">Friends</div>
                                {friends.map(friend => {
                                    const isSelected = selectedFriendIds.has(friend.id);
                                    return (
                                        <div
                                            key={friend.id}
                                            onClick={() => toggleFriendSelection(friend.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${isSelected
                                                ? "bg-indigo-500/10 border-indigo-500/50"
                                                : "bg-zinc-800/20 border-transparent hover:bg-zinc-800/50"
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white font-medium">
                                                {friend.name[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1 text-sm font-medium text-white">
                                                {friend.name}
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-indigo-500 border-indigo-500" : "border-zinc-600"
                                                }`}>
                                                {isSelected && <Check size={12} className="text-white" />}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 py-4">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                    {newGroupName ? (
                                        <span className="text-2xl font-bold text-white max-w-full truncate px-2">
                                            {newGroupName[0].toUpperCase()}
                                        </span>
                                    ) : (
                                        <Users size={32} className="text-zinc-600" />
                                    )}
                                </div>
                                <div className="text-sm text-zinc-500">Group Avatar</div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono text-zinc-500 uppercase">Group Name</label>
                                <input
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="e.g. Project Team"
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-600"
                                    autoFocus
                                />
                            </div>

                            <div className="bg-zinc-800/30 rounded-xl p-3 border border-white/5">
                                <div className="text-xs font-mono text-zinc-500 uppercase mb-2">Members ({selectedFriendIds.size})</div>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(selectedFriendIds).map(id => {
                                        const f = friends.find(friend => friend.id === id);
                                        if (!f) return null;
                                        return (
                                            <span key={id} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md border border-zinc-700">
                                                {f.name}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3">
                    {groupCreationStep === 'select-friends' ? (
                        <>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setGroupCreationStep('group-details')}
                                disabled={selectedFriendIds.size < 2}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setGroupCreationStep('select-friends')}
                                className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft size={14} /> Back
                            </button>
                            <button
                                onClick={onCreateGroup}
                                disabled={!newGroupName.trim() || isCreatingGroup}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                            >
                                {isCreatingGroup ? <Loader2 size={14} className="animate-spin" /> : "Create Group"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
