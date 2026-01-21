import { Conversation } from "../../../services/Conversations";
import { Friend } from "../../../services/Friends";

export const getConversationDisplay = (conv: Conversation, currentUser: any) => {
    if (conv.is_group) {
        return {
            name: conv.name || "Group Chat",
            avatar: null,
            handle: `${conv.participants.length} members`
        };
    }

    const otherParticipant = conv.participants.find(p => p.user_id !== currentUser.id);

    return {
        name: conv.name || "Chat",
        avatar: null,
        handle: conv.is_group ? "Group" : "DM"
    };
};

export const getDisplayInfo = (conv: Conversation, currentUser: any, friends: Friend[]) => {
    if (conv.participants && conv.participants.length > 0) {
        if (conv.is_group) return { name: conv.name, isGroup: true };

        const other = conv.participants.find(p => p.user_id !== currentUser.id);
        if (other) {
            if (other.user?.name) return { name: other.user.name, isGroup: false };
            const friend = friends.find(f => f.id === other.user_id);
            return { name: friend ? friend.name : "Unknown User", isGroup: false };
        }
    }
    return { name: conv.name || "Conversation", isGroup: conv.is_group };
};
