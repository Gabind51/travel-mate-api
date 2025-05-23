package main

import (
    "github.com/gin-gonic/gin"
    "travelmate-api/database"
    "travelmate-api/routes"
    
    _ "travelmate-api/docs" 
)

func main() {
    database.InitDB()
    r := gin.Default()
    routes.SetupRoutes(r)
    r.Run(":8080") // Lancer sur localhost:8080
}
