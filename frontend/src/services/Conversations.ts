import { api } from "./api";

export interface Conversation {
  id: string;
  name: string;
  is_group: boolean;
  created_at: string;
  participants: Participant[];
}

export interface Participant {
  id: string;
  user_id: string;
  conversation_id: string;
  role: string;
  joined_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  type: string;
  created_at: string;
}

export interface CreateConversationRequest {
  name: string;
  isGroup: boolean;
  usernames: string[];
}

export interface SendMessageRequest {
  client_id?: string;
  conversation_id: string;
  content: string;
}

export const handleCreateConversation = async (name: string, isGroup: boolean, usernames: string[]): Promise<Conversation> => {
  try {
    const response = await api.post("/create_conversation", { name, isGroup, usernames } as CreateConversationRequest, {
      withCredentials: true,
    });
    return response.data;
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    throw new Error(e.response?.data?.message || "Could not create conversation.");
  }
};

export const handleGetConversations = async (): Promise<Conversation[]> => {
  try {
    const response = await api.get("/get_conversations", {
      withCredentials: true,
    });
    return response.data || [];
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    throw new Error(e.response?.data?.message || "Could not fetch conversations.");
  }
};

export const handleGetMessages = async (conversationId: string, limit: number = 20, offset: number = 0): Promise<Message[]> => {
  try {
    const response = await api.get(`/get_messages`, {
      params: { conversation_id: conversationId, limit, offset },
      withCredentials: true,
    });
    return response.data || [];
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    throw new Error(e.response?.data?.message || "Could not fetch messages.");
  }
};

export const handleSendMessage = async (conversationId: string, content: string, clientId: string): Promise<Message> => {
  try {
    console.log("handleSendMessage called with:", { conversationId, content, clientId });
    const response = await api.post("/send_message", { conversation_id: conversationId, content, client_id: clientId } as SendMessageRequest, {
       withCredentials: true,
    });
    console.log("handleSendMessage response:", response.data);
    return response.data;
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    throw new Error(e.response?.data?.message || "Could not send message.");
  }
};
