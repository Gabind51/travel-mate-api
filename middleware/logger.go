package middleware

import (
	"fmt"
	"time"

	"travelmate-api/logger"

	"github.com/gin-gonic/gin"
)

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()

		c.Next()

		duration := time.Since(startTime)
		status := c.Writer.Status()
		method := c.Request.Method
		path := c.Request.URL.Path

		// Infos utilisateur depuis le contexte
		userID, _ := c.Get("user_id")
		isAdmin, _ := c.Get("is_admin")

		logMessage := fmt.Sprintf(
			"%s %s | %d | %s | user_id=%v is_admin=%v",
			method, path, status, duration, userID, isAdmin,
		)

		// Log d'erreur ou normal selon le statut
		if status >= 400 {
			logger.ErrorLogger.Println("HTTP ERROR:", logMessage)
		} else {
			logger.InfoLogger.Println("HTTP:", logMessage)
		}
	}
}
