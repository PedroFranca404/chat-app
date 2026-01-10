package auth

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
	ClientId string `json:"client_id"`
}