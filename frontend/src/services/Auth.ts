import { api } from "./api"

export const ValidateUser = async () => {
  try {
    const response = await api.post("/login", {}, { withCredentials: true })
    return response.data;
  } catch {
    return null;
  }
}

export const HandleLogin = async (username: string, password: string) => {
  try {
    await api.post("/login", {
      Username: username,
      Password: password,
    },
      {
        withCredentials: true,
      })
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    if (e.response?.status === 401) {
      throw new Error("Knock knock. Who's there? Not the right password, apparently");
    }
    throw new Error(e.response?.data?.message || "The hamsters running our servers took a break. Try again in a second.");
  }
}

export const handleRegister = async (username: string, password: string) => {
  try {
    await api.post("/register", {
      Username: username,
      Password: password,
    },
      {
        withCredentials: true,
      })
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    const errorMsg = e.response?.data?.toLowerCase?.() || "";
    if (e.response?.status === 409 || errorMsg.includes("duplicate") || errorMsg.includes("unique")) {
      throw new Error("Ups. The username already exists.");
    }
    throw new Error(e.response?.data?.message || "The hamsters running our servers took a break. Try again in a second.");
  }
}

export const handleLogout = async () => {
  try {
    await api.post("/logout", {}, { withCredentials: true })
  } catch (e) {
    console.log(e)
  }
}

export const handleUpdateUser = async (name: string, status: string, avatarUrl: string) => {
  try {
    const response = await api.post("/update_user", {
      name,
      status,
      avatar_url: avatarUrl,
    }, { withCredentials: true });
    return response.data;
  } catch (e: any) {
    if (e.code === "ERR_NETWORK") {
      throw new Error("Oops. Either your servers took a break or you're offline.");
    }
    throw new Error(e.response?.data?.message || "Could not update user.");
  }
}
