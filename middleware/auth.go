package middleware

import (
	"net/http"
	"strings"

	"travelmate-api/utils"

	"github.com/gin-gonic/gin"
)

var SecretKey = []byte("JWT_SECRET")

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token manquant ou invalide"})
			return
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := utils.ParseToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token invalide"})
			return
		}

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Identifiant utilisateur manquant"})
			return
		}
		userID := uint(userIDFloat)

		isAdmin, ok := claims["is_admin"].(bool)
		if !ok {
			isAdmin = false
		}

		c.Set("user_id", userID)
		c.Set("is_admin", isAdmin)

		c.Next()
	}
}

func IsAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token manquant ou invalide"})
			return
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")

		claims, err := utils.ParseToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token invalide"})
			return
		}

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "L'identifiant de l'utilisateur est manquant dans le token"})
			return
		}
		userID := uint(userIDFloat)

		isAdmin, ok := claims["is_admin"].(bool)
		if !ok || !isAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Accès réservé aux administrateurs"})
			return
		}

		c.Set("user_id", userID)
		c.Set("is_admin", isAdmin)

		c.Next()
	}
}
