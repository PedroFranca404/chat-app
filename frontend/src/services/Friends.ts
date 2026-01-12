import { api } from "./api"

export const handleGetFriends = async () => {
  try {
    const response = await api.post("/get_friends", {}, {
      withCredentials: true,
    })
    return response.data;
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    throw new Error(e.response?.data?.message || "The hamsters running our servers took a break. Try again in a second.");
  }
}