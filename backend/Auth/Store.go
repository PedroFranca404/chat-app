package auth

import "sync"

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

var userDB = map[string]string{}
var dbLock sync.Mutex