package main

import (
	"log"
	"time"
	"travelmate-api/database"
	"travelmate-api/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	_ "travelmate-api/docs"

	"github.com/joho/godotenv"
)

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Println("Pas de .env détecté")
    }

    database.InitDB()
    r := gin.Default()

    r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // ← Flutter Web ou autre front
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

    routes.SetupRoutes(r)
    r.Run("0.0.0.0:8080") // Lancer sur localhost:8080
}
