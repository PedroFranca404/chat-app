import { useEffect } from "react";
import { Message } from "../services/Conversations";
import { MessageUI, ChatMap } from "../utils/types";

interface UseWebSocketProps {
    currentUser: any;
    wsBaseUrl: string;
    setMessages: React.Dispatch<React.SetStateAction<ChatMap>>;
}

export const useWebSocket = ({ currentUser, wsBaseUrl, setMessages }: UseWebSocketProps) => {
    useEffect(() => {
        if (!currentUser) return;

        let ws: WebSocket | null = null;
        const timer = setTimeout(() => {
            const wsUrl = `${wsBaseUrl}?client_id=${currentUser.client_id}`;

            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("Connected to WebSocket");
            };

            ws.onmessage = (event) => {
                try {
                    const msg: Message = JSON.parse(event.data);
                    const mappedMsg: MessageUI = {
                        id: msg.id,
                        text: msg.content,
                        sender: msg.sender_id === currentUser.id ? "me" : msg.sender_id,
                        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        read: true
                    };

                    setMessages(prev => {
                        const chatMsgs = prev[msg.conversation_id] || [];
                        const existingIndex = chatMsgs.findIndex(m => m.id === msg.id);
                        if (existingIndex !== -1) {
                            const updatedMsgs = [...chatMsgs];
                            updatedMsgs[existingIndex] = mappedMsg;
                            return { ...prev, [msg.conversation_id]: updatedMsgs };
                        }
                        return { ...prev, [msg.conversation_id]: [...chatMsgs, mappedMsg] };
                    });
                } catch (e) {
                    console.error("WS Message Error", e);
                }
            };

            ws.onclose = () => {
                console.log("Disconnected from WebSocket");
            };
        }, 50);

        return () => {
            clearTimeout(timer);
            if (ws) {
                ws.close();
            }
        };
    }, [currentUser, wsBaseUrl, setMessages]);
};
