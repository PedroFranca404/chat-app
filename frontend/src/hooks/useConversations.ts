import { useEffect } from "react";
import { handleGetConversations, handleGetMessages, Conversation } from "../services/Conversations";
import { MessageUI, ChatMap } from "../utils/types";

export const useFetchConversations = (
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
) => {
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const convs = await handleGetConversations();
            const uniqueConvs = Array.from(new Map(convs.map(c => [c.id, c])).values());
            setConversations(uniqueConvs);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        }
    };

    return { fetchConversations };
};

export const useFetchMessages = (
    activeChat: string | null,
    currentUser: any,
    setMessages: React.Dispatch<React.SetStateAction<ChatMap>>
) => {
    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat);
        }
    }, [activeChat]);

    const fetchMessages = async (chatId: string) => {
        try {
            const msgs = await handleGetMessages(chatId);
            const mappedMessages: MessageUI[] = msgs.map(m => ({
                id: m.id,
                text: m.content,
                sender: m.sender_id === currentUser.id ? "me" : m.sender_id,
                time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: true
            })).reverse();

            setMessages(prev => ({
                ...prev,
                [chatId]: mappedMessages
            }));
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    return { fetchMessages };
};
