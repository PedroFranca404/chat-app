package api

import (
	"errors"
	"sync"

	"github.com/PedroFranca404/chat-app/config"
	"github.com/PedroFranca404/chat-app/schemas"
)

type UserSessionCache struct {
	sessions map[string]*schemas.Users
	mu       sync.RWMutex
}

var SessionCache = UserSessionCache{
	sessions: make(map[string]*schemas.Users),
}

func (c *UserSessionCache) Get(clientId string) (*schemas.Users, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	user, exists := c.sessions[clientId]
	return user, exists
}

func (c *UserSessionCache) Set(clientId string, user *schemas.Users) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.sessions[clientId] = user
}

func (c *UserSessionCache) Delete(clientId string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	delete(c.sessions, clientId)
}

func ValidateUser(clientId string) (*schemas.Users, error) {
	if clientId == "" {
		return nil, errors.New("client_id is required")
	}

	if user, found := SessionCache.Get(clientId); found {
		return user, nil
	}

	var user schemas.Users
	result := config.DB.Where("client_id = ?", clientId).First(&user)
	if result.Error != nil {
		return nil, errors.New("invalid client_id")
	}

	SessionCache.Set(clientId, &user)

	return &user, nil
}
