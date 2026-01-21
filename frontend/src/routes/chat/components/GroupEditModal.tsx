import React from "react";
import { X, Loader2 } from "lucide-react";

interface GroupEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    editGroupName: string;
    setEditGroupName: (name: string) => void;
    editGroupDesc: string;
    setEditGroupDesc: (desc: string) => void;
    editGroupAvatar: string;
    setEditGroupAvatar: (avatar: string) => void;
    isUpdatingGroup: boolean;
    onUpdateGroup: () => void;
}

export const GroupEditModal: React.FC<GroupEditModalProps> = ({
    isOpen,
    onClose,
    editGroupName,
    setEditGroupName,
    editGroupDesc,
    setEditGroupDesc,
    editGroupAvatar,
    setEditGroupAvatar,
    isUpdatingGroup,
    onUpdateGroup
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Edit Group Details</h3>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Group Name</label>
                        <input
                            value={editGroupName}
                            onChange={(e) => setEditGroupName(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Description</label>
                        <textarea
                            value={editGroupDesc}
                            onChange={(e) => setEditGroupDesc(e.target.value)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-indigo-500/50 min-h-[80px]"
                            placeholder="Add a group description..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Avatar URL</label>
                        <input
                            value={editGroupAvatar}
                            onChange={(e) => setEditGroupAvatar(e.target.value)}
                            placeholder="https://example.com/image.png"
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-zinc-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 hover:bg-zinc-800 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onUpdateGroup}
                        disabled={isUpdatingGroup || !editGroupName.trim()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2"
                    >
                        {isUpdatingGroup ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};
