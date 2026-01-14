import { api } from "./api"

export interface Friend {
  id: string;
  name: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  sender_name: string;
}

export const handleGetFriends = async (): Promise<Friend[]> => {
  try {
    const response = await api.get("/get_friends", {
      withCredentials: true,
    });
    return response.data || [];
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    throw new Error(e.response?.data?.message || "The hamsters running our servers took a break. Try again in a second.");
  }
};

export const handleSendFriendRequest = async (username: string): Promise<{ message: string }> => {
  try {
    const response = await api.post("/send_friend_request", { username }, {
      withCredentials: true,
    });
    return response.data;
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    if (e.response?.status === 404) {
      throw new Error("Oopsie doopsie. I don't know who that is...");
    }
    if (e.response?.status === 400) {
      throw new Error(e.response?.data || "Humm... It seems I couldn't send that request.");
    }
    throw new Error(e.response?.data?.message || "Heyy, something went wrong. Could you try again?");
  }
};

export const handleGetFriendRequests = async (): Promise<FriendRequest[]> => {
  try {
    const response = await api.get("/get_friend_requests", {
      withCredentials: true,
    });
    return response.data || [];
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    return [];
  }
};

export const handleAcceptFriendRequest = async (requestId: string): Promise<{ message: string }> => {
  try {
    const response = await api.post("/accept_friend_request", { request_id: requestId }, {
      withCredentials: true,
    });
    return response.data;
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    throw new Error(e.response?.data?.message || "Could not accept friend request.");
  }
};

export const handleRejectFriendRequest = async (requestId: string): Promise<{ message: string }> => {
  try {
    const response = await api.post("/reject_friend_request", { request_id: requestId }, {
      withCredentials: true,
    });
    return response.data;
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    throw new Error(e.response?.data?.message || "Could not reject friend request.");
  }
};