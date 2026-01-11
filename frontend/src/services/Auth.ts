import { api } from "./api"

export const ValidateUser = async () => {
  try {
    const response = await api.post("/login", {}, {withCredentials: true})
    return response.status === 200;
  } catch {
    return false;
  }
}

export const HandleLogin = async (username: string , password: string) => {
  try {
    await api.post("/login", {
      Username: username,
      Password: password,
    },
    {
      withCredentials: true,
    })
  } catch (e) {
    console.log(e)
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
  } catch (e) {
    console.log(e)
  }
}

export const handleLogout = async () => {
  try {
    await api.post("/logout", {}, {withCredentials: true})
  } catch (e) {
    console.log(e)
  }
}
